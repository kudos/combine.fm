"use strict";
var path = require('path');

var services = [];

require("fs").readdirSync(path.join(__dirname, "services")).forEach(function(file) {
  var service = require(path.join(__dirname, "services", file));
  if (service.search) {
    services.push(service);
  }
});

module.exports = function(url) {

  var matchedService;
  services.some(function(service) {
    matchedService = service.match(url) ? service : null;
    return matchedService;
  });
  
  if (matchedService) {
    return matchedService.parseUrl(url).timeout(10000).then(function(result) {
      return matchedService.lookupId(result.id, result.type).then(function(item) {
        return item;
      });
    });
  }
};
