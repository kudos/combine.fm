"use strict";
var path = require('path');
var Promise = require('bluebird');
var util = require('util');

var browserify = require('connect-browserify');
var React = require('react');
var Router = require('react-router');
var nodejsx = require('node-jsx').install();
var routes = require('../views/app.jsx').routes;

var services = require('../lib/services');

var formatAndSort = function(matches, serviceId) {
  matches = Object.keys(matches).map(function (key) {return matches[key]});
  matches.sort(function(a, b) {
    return a.id && !b.id;
  }).sort(function(a, b) {
    return b.type == "video";
  }).sort(function(a, b) {
    return a.service != serviceId;
  });
  return matches;
}

module.exports = function(req, res, next) {
  var serviceId = req.params.service;
  var type = req.params.type;
  var itemId = req.params.id;

  var matchedService;
  services.some(function(service) {
    matchedService = serviceId == service.id ? service : null;
    return matchedService;
  });

  if (!matchedService || (type != "album" && type != "track")) {
    return next();
  }

  return req.db.matches.findOne({_id:serviceId + "$$" + itemId}).then(function(doc) {
    if (!doc) {
      return matchedService.lookupId(itemId, type).then(function(item) {
        var matches = {};
        item.matched_at = new Date();
        matches[item.service] = item;
        services.forEach(function(service) {
          if (service.id == item.service) {
            return;
          }
          matches[service.id] = {service: service.id};
          service.search(item).then(function(match) {
            match.matched_at = new Date();
            var update = {};
            update["services." + match.service] = match;
            req.db.matches.update({_id: item.service + "$$" + item.id}, {"$set": update});
          });
        });
        return req.db.matches.save({_id: item.service + "$$" + item.id, created_at: new Date(), services:matches}).then(function() {
          var shares = formatAndSort(matches, serviceId);
          Router.run(routes, req.url, function (Handler) {
            var App = React.createFactory(Handler);
            var content = React.renderToString(new App({shares: shares}));
            res.send('<!doctype html>\n' + content.replace("</body></html>", "<script>var shares = " + JSON.stringify(shares) + "</script></body></html>"));
          });
        });
      })
    }
    var shares = formatAndSort(doc.services, serviceId);
    if (req.params.format == "json") {
      return res.json({shares:shares});
    }
    Router.run(routes, req.url, function (Handler) {
      var App = React.createFactory(Handler);
      var content = React.renderToString(new App({shares: shares}));
      res.send('<!doctype html>\n' + content.replace("</body></html>", "<script>var shares = " + JSON.stringify(shares) + "</script></body></html>"));
    });
  }).catch(function (error) {
    return next(error);
  });

};
