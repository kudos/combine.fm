var express = require('express');
var router = express.Router();

var googleplaymusic = require('../lib/googleplaymusic');
var spotify = require('../lib/spotify');

//https://play.spotify.com/album/3W3ENDBQMJ9bD2qmxWI2f0
//https://play.google.com/music/listen#/album/B3lxthejqxjxja2bhzchcw5qaci

router.get('/:service/:type/:id', function(req, res) {
  var service = req.params.service;
  var type = req.params.type;
  var id = req.params.id;

  switch(service) {
    case "spotify":
      spotify.lookupId(id, type, function(spotifyAlbum) {
        googleplaymusic.search(spotifyAlbum.artist.name + " " + spotifyAlbum.name, "album", function(googleAlbum) {
          res.render('album', {googleAlbum: googleAlbum, spotifyAlbum: spotifyAlbum});
        });
      });
      break;
    case "google":
      googleplaymusic.lookupId(id, type, function(googleAlbum) {
        spotify.search(googleAlbum.artist.name + " " + googleAlbum.name, "album", function(spotifyAlbum) {
          res.render('album', {googleAlbum: googleAlbum, spotifyAlbum: spotifyAlbum});
        });
      });
      break;
  }
});

router.post('/search', function(req, res) {
  // determine spotify or google music
  var url = req.body.url;

  if (url.match(/spotify\.com/)) {
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
