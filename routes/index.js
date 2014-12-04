"use strict";
var parse = require('url').parse;
var path = require('path');
var express = require('express');
var router = express.Router();
var Q = require('q');

var services = {};

require("fs").readdirSync(path.join(__dirname, "..", "lib", "services")).forEach(function(file) {
  var service = require("../lib/services/" + file);
  if (service.search) {
    services[service.id] = service;
  }
});

var cache = {googleplaymusic:{}, spotify:{},rdio:{}};

router.get('/:service/:type/:id', function(req, res) {
  var serviceId = req.params.service;
  var type = req.params.type;
  var itemId = req.params.id;
  var promises = [];

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
      items.unshift(item);

      res.render(type, {items: items});
    });
  });
});

router.post('/search', function(req, res) {
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
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { error: req.flash('search-error') });
});

module.exports = router;
