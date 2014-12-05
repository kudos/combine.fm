"use strict";
var parse = require('url').parse;
var path = require('path');
var Q = require('q');

var services = {};

require("fs").readdirSync(path.join(__dirname, "..", "lib", "services")).forEach(function(file) {
  var service = require("../lib/services/" + file);
  if (service.search) {
    services[service.id] = service;
  }
});

module.exports = function(req, res) {
  var url = parse(req.body.url);
  var searching = false;

  if (!url.host) {
    req.flash('search-error', 'Paste a music link above to find and share the matches');
    res.redirect('/');
    return;
  }

  for (var id in services) {
    var matched = services[id].match(req.body.url);
    if (matched) {
      searching = true;
      Q.timeout(services[id].parseUrl(req.body.url), 5000).then(function(result) {
        if (!result.id) {
          req.flash('search-error', 'No match found for this link');
          res.redirect('/');
        }
        res.redirect("/" + id + "/" + result.type + "/" + result.id);
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

      break;
    }
  }
  if (!searching) {
    req.flash('search-error', 'No match found for this link');
    res.redirect('/');
  }
};
