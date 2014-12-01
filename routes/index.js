var express = require('express');
var router = express.Router();

var googleplaymusic = require('../lib/googleplaymusic');
var spotify = require('../lib/spotify');
var rdio = require('../lib/rdio');

router.get('/:service/:type/:id', function(req, res) {
  var service = req.params.service;
  var type = req.params.type;
  var id = req.params.id;

  switch(service) {
    case "spotify":
      spotify.lookupId(id, type, function(spotifyAlbum) {
        googleplaymusic.search(spotifyAlbum.artist.name + " " + spotifyAlbum.name, "album", function(googleAlbum) {
          rdio.search(googleAlbum.artist.name + " " + googleAlbum.name, "album", function(rdioAlbum) {
            res.render('album', {rdioAlbum: rdioAlbum, googleAlbum: googleAlbum, spotifyAlbum: spotifyAlbum});
          });
        });
      });
      break;
    case "google":
      googleplaymusic.lookupId(id, type, function(googleAlbum) {
        spotify.search(googleAlbum.artist.name + " " + googleAlbum.name, "album", function(spotifyAlbum) {
          rdio.search(googleAlbum.artist.name + " " + googleAlbum.name, "album", function(rdioAlbum) {
            res.render('album', {rdioAlbum: rdioAlbum, googleAlbum: googleAlbum, spotifyAlbum: spotifyAlbum});
          });
        });
      });
      break;
    case "rdio":
      rdio.lookupId(id, function(rdioAlbum) {
        googleplaymusic.search(rdioAlbum.artist.name + " " + rdioAlbum.name, "album", function(googleAlbum) {
          spotify.search(rdioAlbum.artist.name + " " + rdioAlbum.name, "album", function(spotifyAlbum) {
            res.render('album', {rdioAlbum: rdioAlbum, googleAlbum: googleAlbum, spotifyAlbum: spotifyAlbum});
          });
        });
      });
      break;
  }
});

router.post('/search', function(req, res) {
  // determine spotify or google music
  var url = req.body.url;

  if (url.match(/rd\.io/) || url.match(/rdio\.com/)) {
    rdio.lookupUrl(url, function(result) {
      if (!result.id) {
        req.flash('search-error', 'No match found for this link');
        res.redirect('/');
      }
      res.redirect("/rdio/" + result.type + "/" + result.id);
    });
  } else if (url.match(/spotify\.com/)) {
    spotify.parseUrl(url, function(result) {
      if (!result.id) {
        req.flash('search-error', 'No match found for this link');
        res.redirect('/');
      }
      res.redirect("/spotify/" + result.type + "/" + result.id);
    });
  } else if (url.match(/play\.google\.com/)) {
    googleplaymusic.parseUrl(url, function(result) {
      if (!result.id) {
        req.flash('search-error', 'No match found for this link');
        res.redirect('/');
      }
      res.redirect("/google/" + result.type + "/" + result.id);
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
