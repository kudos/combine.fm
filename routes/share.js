"use strict";
var path = require('path');
var Promise = require('bluebird');

var services = {};

require("fs").readdirSync(path.join(__dirname, "..", "lib", "services")).forEach(function(file) {
  var service = require("../lib/services/" + file);
  if (service.search) {
    services[service.id] = service;
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
      res.render(type, {
        page: type,
        title: doc.items[0].name + " by " + doc.items[0].artist.name,
        items: doc.items,
        thisUrl: req.userProtocol + '://' + req.get('host') + req.originalUrl
      });
    } else {
      services[serviceId].lookupId(itemId, type).timeout(10000).then(function(item) {
        for (var id in services) {
          if (id != serviceId) {
            promises.push(services[id].search(item).timeout(10000));
          }
        }

        Promise.settle(promises).then(function(results) {
          var items = results.map(function(result) {
            if (result.isFulfilled()) {
              return result.value();
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
          res.render(type, {
            page: type,
            title: item.name + " by " + item.artist.name,
            items: items,
            thisUrl: req.userProtocol + '://' + req.get('host') + req.originalUrl
          });
        });
      }, function(error) {
        if (error.code == "ETIMEDOUT") {
          error = new Error("Error talking to music service");
          error.status = "502";
        } else if (!error.status) {
          error = new Error("An unexpected error happenend");
          error.status = 500;
        }
        next(error);
      });
    }
  });
};
