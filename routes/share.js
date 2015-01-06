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
    var shares = Object.keys(doc.services).map(function (key) {return doc.services[key]});
    if (req.params.format == "json") {
      return res.json({shares:shares});
    }
    Router.run(routes, req.url, function (Handler) {
      var App = React.createFactory(Handler);
      var content = React.renderToString(App({shares: shares}));
      res.send('<!doctype html>\n' + content.replace("</body></html>", "<script>var shares = " + JSON.stringify(shares) + "</script></body></html>"));
    });
  }).catch(function (error) {
    return next(error);
  });

};
