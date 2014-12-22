"use strict";
var path = require('path');
var Promise = require('bluebird');
var util = require('util');

var browserify = require('connect-browserify');
var React = require('react');
var Router = require('react-router');
var nodejsx = require('node-jsx').install();
var routes = require('../views/app.jsx').routes;

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

  req.db.matches.findOne({_id:serviceId + "$$" + itemId}, function(err, doc) {
    if (err) {
      return next(new Error());
    } else if (!doc) {
      return next();
    }
    var shares = [];
    for (var docService in Object.keys(services)) {
      var loopServiceId = Object.keys(services)[docService];
      shares.push(doc.services[loopServiceId]);
      if (doc.services[loopServiceId].id === undefined) {
        services[loopServiceId].search(doc.services[serviceId]).timeout(15000).then(function(item) {
          if (!item.id) {
            item.id = null;
          }

          var set = {};
          set["services." + item.service] = item;
          req.db.matches.update({_id: serviceId + "$$" + itemId}, {$set: set});
        }).catch(function(err) {
          console.log(err)
        });
      }
    }
    
    var shares = shares.filter(function(item) {
      return item.service != serviceId;
    });
    
    shares.sort(function(a, b) {
      return !a.id || !b.id;
    }).sort(function(a, b) {
      return !a.streamUrl || b.streamUrl;
    }).sort(function(a, b) {
      return a.type == "video" && b.type != "video";
    });
    
    shares.unshift(doc.services[serviceId]);
    if (req.accepts(['html', 'json']) === 'json') {
      req.db.matches.findOne({_id:serviceId + "$$" + itemId}, function(err, doc) {
        res.json({shares:shares});
      });
    } else {
      Router.run(routes, req.url, function (Handler) {
        var App = React.createFactory(Handler);
        var content = React.renderToString(App({shares: shares}));
        res.send('<!doctype html>\n' + content.replace("</body></html>", "<script>var shares = " + JSON.stringify(shares) + "</script></body></html>"));
      });
    }
    
  });
};
