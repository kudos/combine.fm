"use strict";
var parse = require('url').parse;
var path = require('path');

var services = {};

require("fs").readdirSync(path.join(__dirname, "..", "lib", "services")).forEach(function(file) {
  var service = require("../lib/services/" + file);
  if (service.search) {
    services[service.id] = service;
  }
});

module.exports = function(req, res, next) {
  var url = parse(req.body.url);
  var searching = false;

  if (!url.host) {
    req.flash('search-error', 'Paste a music link above to find and share the matches');
    res.redirect('/');
  } else {
    var items = {};
    for (var id in services) {
      items[id] = {service: id};
    }
    for (var id in services) {
      var matched = services[id].match(req.body.url);
      if (matched) {
        searching = true;
        services[id].parseUrl(req.body.url).timeout(10000).then(function(result) {
          if (!result.id) {
            res.json({error:{message:"No match found for url"}});
          } else {
            services[id].lookupId(result.id, result.type).then(function(item) {
              items[id] = item;
              req.db.matches.save({_id:id + "$$" + result.id, created_at: new Date(), services:items}).then(function() {
                setTimeout(function() {
                  res.json(item);
                }, 1000)
              });
            });
          }
        }, function(error) {
          if (error.code == "ETIMEDOUT") {
            error = new Error("Error talking to music service");
            error.status = "502";
            next(error);
          } else if (!error || !error.status) {
            error = new Error("An unexpected error happenend");
            error.status = 500;
            next(error);
          } else if (error.status == 404){
            res.json({error:{message:"No match found for url"}});
          }
        });
        break;
      }
    }
  }
  if (url.host && !searching) {
    res.json({error:{message:"No match found for url"}});
  }
};
