"use strict";
var path = require('path');
var Q = require('q');

var services = {};

var cache = {};

require("fs").readdirSync(path.join(__dirname, "..", "lib", "services")).forEach(function(file) {
  var service = require("../lib/services/" + file);
  if (service.search) {
    services[service.id] = service;
    cache[service.id] = {};
  }
});


module.exports = function(req, res, next) {
  var serviceId = req.params.service;
  var type = req.params.type;
  var itemId = req.params.id;
  var promises = [];

  if (!services[serviceId] || (type != "album" && type != "track")) {
    next();
    return;
  }


  req.db.matches.findOne({_id:serviceId + itemId}).then(function(doc) {
    if (doc) {
      res.render(type, {page: type, items: doc.items});
    } else {
      Q.timeout(services[serviceId].lookupId(itemId, type), 5000).then(function(item) {
        for (var id in services) {
          if (id != serviceId) {
            promises.push(Q.timeout(services[id].search(item), 5000));
          }
        }

        Q.allSettled(promises).then(function(results) {
          var items = results.map(function(result) {
            if (result.state == "fulfilled") {
              return result.value;
            }
          }).filter(function(result) {
            return result || false;
          });

          items.sort(function(a, b) {
            return !a.id || !b.id;
          }).sort(function(a, b) {
            return !a.streamUrl || b.streamUrl;
          }).sort(function(a, b) {
            return a.type == "video" && b.type != "video";
          });

          items.unshift(item);
          req.db.matches.save({_id:serviceId + itemId, items:items});
          cache[serviceId][type + "-" + itemId] = items;
          res.render(type, {page: type, items: items});
        });
      }, function(err) {
        var error = new Error("An unexpected error happenend")
        if (err.code == "ETIMEDOUT") {
          error = new Error("Error talking to music service");
          error.status = "502";
        }
        next(error);
      });
    }
  });
};
