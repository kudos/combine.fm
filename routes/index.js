"use strict";
var parse = require('url').parse;
var express = require('express');
var router = express.Router();

var googleplaymusic = require('../lib/googleplaymusic');
var spotify = require('../lib/spotify');
var rdio = require('../lib/rdio');

var cache = {googleplaymusic:{}, spotify:{},rdio:{}};

router.get('/:service/:type/:id', function(req, res) {
  var service = req.params.service;
  var type = req.params.type;
  var id = req.params.id;
  var items = [];

  switch(service) {
    case "spotify":
      spotify.lookupId(id, type, function(result) {
        items.push(result);
        googleplaymusic.search(result, function(item) {
          items.push(item);
          rdio.search(result, function(item) {
            items.push(item);
            res.render(result.type, {items: items});
          });
        });
      });
      break;
    case "google":
      googleplaymusic.lookupId(id, type, function(result) {
        items.push(result);
        spotify.search(result, function(item) {
          items.push(item);
          rdio.search(result, function(item) {
            items.push(item);
            res.render(result.type, {items: items});
          });
        });
      });
      break;
    case "rdio":
      rdio.lookupId(id, function(result) {
        items.push(result);
        googleplaymusic.search(result, function(item) {
          items.push(item);
          spotify.search(result, function(item) {
            items.push(item);
            res.render(result.type, {items: items});
          });
        });
      });
      break;
  }
});

router.post('/search', function(req, res) {
  // determine spotify or google music
  var url = parse(req.body.url);

  if (url.host.match(/rd\.io$/) || url.host.match(/rdio\.com$/)) {
    rdio.lookupUrl(url.href, function(result) {
      if (!result.id) {
        req.flash('search-error', 'No match found for this link');
        res.redirect('/');
      }
      res.redirect("/rdio/" + result.type + "/" + result.id);
    });
  } else if (url.host.match(/spotify\.com$/)) {
    spotify.parseUrl(url.href, function(result) {
      if (!result.id) {
        req.flash('search-error', 'No match found for this link');
        res.redirect('/');
      }
      res.redirect("/spotify/" + result.type + "/" + result.id);
    });
  } else if (url.host.match(/play\.google\.com$/)) {
    googleplaymusic.parseUrl(url.href, function(result) {
      if (!result) {
        req.flash('search-error', 'No match found for this link');
        res.redirect('/');
      } else {
        res.redirect("/google/" + result.type + "/" + result.id);
      }
    });
  } else {
    req.flash('search-error', 'No match found for this link');
    res.redirect('/');
  }
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { error: req.flash('search-error') });
});

module.exports = router;
