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

module.exports = function(req, res) {
  var serviceId = req.params.service;
  var type = req.params.type;
  var itemId = req.params.id;
  var promises = [];

  if (cache[serviceId][type + "-" + itemId]) {
    res.render(type, {page: type, items: cache[serviceId][type + "-" + itemId]});
    return;
  }

  services[serviceId].lookupId(itemId, type).then(function(item) {
    for (var id in services) {
      if (id != serviceId) {
        promises.push(services[id].search(item));
      }
    }

    Q.allSettled(promises).then(function(results) {
      var items = results.map(function(result) {
        if (result.state == "fulfilled") {
          return result.value;
        }
      });

      items.sort(function(a, b) {
        return !a.id || !b.id;
      }).sort(function(a, b) {
        return !a.streamUrl || b.streamUrl;
      });

      items.unshift(item);
      cache[serviceId][type + "-" + itemId] = items;
      res.render(type, {page: type, items: items});
    });
  });
};
