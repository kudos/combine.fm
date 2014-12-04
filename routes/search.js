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

  if (!url.host) {
    req.flash('search-error', 'Please paste a link below to find matches');
    res.redirect('/');
    return;
  }

  for (var id in services) {
    var matched = services[id].match(req.body.url);
    if (matched) {
      services[id].parseUrl(req.body.url).then(function(result) {
        if (!result.id) {
          req.flash('search-error', 'No match found for this link');
          res.redirect('/');
        }
        res.redirect("/" + id + "/" + result.type + "/" + result.id);
      })
      return;
    }
  }

  req.flash('search-error', 'No match found for this link');
  res.redirect('/');
};
