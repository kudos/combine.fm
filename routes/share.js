"use strict";
var path = require('path');
var Promise = require('bluebird');
var util = require('util');

var browserify = require('connect-browserify');
var React = require('react');
var nodejsx = require('node-jsx').install();
var Share = React.createFactory(require('../client/share').Share);

var services = {};

require("fs").readdirSync(path.join(__dirname, "..", "lib", "services")).forEach(function(file) {
  var service = require("../lib/services/" + file);
  if (service.search) {
    services[service.id] = service;
  }
});


module.exports.html = function(req, res, next) {
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
    }
    var items = [];
    for (var docService in Object.keys(services)) {
      var loopServiceId = Object.keys(services)[docService];
      items.push(doc.services[loopServiceId]);
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
    
    var items = items.filter(function(item) {
      return item.service != serviceId;
    });
    
    items.sort(function(a, b) {
      return !a.id || !b.id;
    }).sort(function(a, b) {
      return !a.streamUrl || b.streamUrl;
    }).sort(function(a, b) {
      return a.type == "video" && b.type != "video";
    });
    
    items.unshift(doc.services[serviceId]);

    var share = Share({items: items});
    res.send('<!doctype html>\n' + React.renderToString(share).replace("</body></html>", "<script>var items = " + JSON.stringify(items) + "</script></body></html>"));

    // res.render(type, {
    //   page: type,
    //   title: doc.services[serviceId].name + " by " + doc.services[serviceId].artist.name,
    //   matching: doc.services[serviceId],
    //   matches: items,
    //   thisUrl: req.userProtocol + '://' + req.get('host') + req.originalUrl
    // });
  });
};

module.exports.json = function(req, res, next) {
  var serviceId = req.params.service;
  var type = req.params.type;
  var itemId = req.params.id;
  var promises = [];
  
  if (!services[serviceId] || (type != "album" && type != "track")) {
    next();
    return;
  }
  
  req.db.matches.findOne({_id:serviceId + "$$" + itemId}, function(err, doc) {
    res.json(doc);
  });
};