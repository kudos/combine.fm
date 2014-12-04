"use strict";
var parse = require("url").parse;
var PlayMusic = require('playmusic');
var pm = new PlayMusic();

if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
  throw new Error("You need to set GOOGLE_EMAIL and GOOGLE_PASSWORD environment variables");
}

// It's probably ok to not wait for this to finish
pm.init({email: process.env.GOOGLE_EMAIL, password: process.env.GOOGLE_PASSWORD}, function() {});

module.exports.lookupId = function(id, type, next) {
  if (type == "album") {
    pm.getAlbum(id, true, function(album) {
      next({
        service: "googleplaymusic",
        type: "album",
        id: album.albumId,
        name: album.name,
        url: "https://play.google.com/music/listen#/album/" + album.albumId,
        artwork: album.albumArtRef.replace("http:", ""),
        artist: {
          name: album.artist
        }
      });
    });
  } else if (type == "track") {
    pm.getAllAccessTrack(id, function(track) {
      next({
        service: "googleplaymusic",
        type: "track",
        id: track.nid,
        name: track.title,
        url: "https://play.google.com/music/listen#/track/" + track.nid + "/" + track.albumId,
        artwork: track.albumArtRef[0].url.replace("http:", ""),
        album: {
          name: track.album
        },
        artist: {
          name: track.artist
        }
      });
    });
  }
}

module.exports.search = function(data, next) {
  var query = "";
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
  }

  pm.search(query, 5, function(data) { // max 5 results
    var result = data.entries.filter(function(result) {
      return result[type];
    }).sort(function(a, b) { // sort by match score
      return a.score < b.score;
    }).shift();

    if (!result.album && !result.track) {
      next({service:"googleplaymusic"});
    }

    var id;
    if (type == "album") {
      id = result.album.albumId;
    } else if (type == "track") {
      id = result.track.nid;
    }

    module.exports.lookupId(id, type, next);
  });
}

module.exports.parseUrl = function(url, next) {
  var parsed = parse(url.replace(/\+/g, "%20"));
  var path = parsed.path;
  var hash = parsed.hash;
  if (hash) {
    var parts = hash.split("/");
    var type = parts[1];
    var id = parts[2];
    var artist = decodeURIComponent(parts[3]);
    var album = decodeURIComponent(parts[4]);

    if (id.length > 0) {
      return next({id: id, type: type});
    } else {
      module.exports.search({type: type, name:album, artist: {name: artist}}, next);
    }
  } else if(path) {
    var matches = path.match(/\/music\/m\/([\w]+)/);
    var type = matches[1][0] == "T" ? "track" : "album";
    module.exports.lookupId(matches[1], type, next);
  }
}
