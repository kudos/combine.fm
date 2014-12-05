"use strict";
var parse = require("url").parse;
var PlayMusic = require('playmusic');
var pm = new PlayMusic();
var Q = require('q');

module.exports.id = "google";

if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
  console.warn("GOOGLE_EMAIL or GOOGLE_PASSWORD environment variables not found, deactivating Rdio.");
  return;
}

var ready = Q.defer();

pm.init({email: process.env.GOOGLE_EMAIL, password: process.env.GOOGLE_PASSWORD}, function() {
  ready.resolve();
});

module.exports.match = function(url, type) {
  var parsed = parse(url);
  return parsed.host.match(/play\.google\.com$/);
};

module.exports.lookupId = function(id, type, next) {
  var deferred = Q.defer();
  ready.promise.then(function() {
    if (type == "album") {
      pm.getAlbum(id, false, function(album) {
        deferred.resolve({
          service: "googleplaymusic",
          type: "album",
          id: album.albumId,
          name: album.name,
          streamUrl: "https://play.google.com/music/listen#/album/" + album.albumId,
          purchaseUrl: "https://play.google.com/store/music/album?id=" + album.albumId,
          artwork: album.albumArtRef.replace("http:", ""),
          artist: {
            name: album.artist
          }
        });
      }, function(error) {
        deferred.reject(error);
      });
    } else if (type == "track") {
      pm.getAllAccessTrack(id, function(track) {
        deferred.resolve({
          service: "googleplaymusic",
          type: "track",
          id: track.nid,
          name: track.title,
          streamUrl: "https://play.google.com/music/listen#/track/" + track.nid + "/" + track.albumId,
          purchaseUrl: "https://play.google.com/store/music/album?id=" + track.albumId,
          artwork: track.albumArtRef[0].url.replace("http:", ""),
          album: {
            name: track.album
          },
          artist: {
            name: track.artist
          }
        });
      }, function(error) {
        deferred.reject(error);
      });
    }
  });
  return deferred.promise;
}

module.exports.search = function(data) {
  var deferred = Q.defer();
  ready.promise.then(function() {
    var query, album;
    var type = data.type;

    if (type == "album") {
      query = data.artist.name + " " + data.name;
      album = data.name;
    } else if (type == "track") {
      query = data.artist.name + " " + data.album.name + " " + data.name;
      album = data.album.name;
    }

    pm.search(query, 5, function(result) {
      if (!result.entries) {
        var matches = album.match(/^[^\(\[]+/);
        if (matches[0]) {
          var cleanedData = JSON.parse(JSON.stringify(data));
          if (type == "album") {
            cleanedData.name = matches[0].trim();
          } else if (type == "track") {
            cleanedData.album = matches[0].trim();
          }
          module.exports.search(cleanedData).then(deferred.resolve);
        } else {
          deferred.resolve({service: "googleplaymusic"});
        }
        return;
      }
      var result = result.entries.filter(function(result) {
        return result[type];
      }).sort(function(a, b) { // sort by match score
        return a.score < b.score;
      }).shift();

      if (!result) {
        deferred.resolve({service: "googleplaymusic"});
      } else {
        var id;
        if (type == "album") {
          id = result.album.albumId;
        } else if (type == "track") {
          id = result.track.nid;
        }

        module.exports.lookupId(id, type).then(deferred.resolve);
      }
    });
  });
  return deferred.promise;
}

module.exports.parseUrl = function(url, next) {
  var deferred = Q.defer();
  ready.promise.then(function() {
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
        deferred.resolve({id: id, type: type});
      } else {
        module.exports.search({type: type, name:album, artist: {name: artist}}).then(deferred.resolve);
      }
    } else if(path) {
      var matches = path.match(/\/music\/m\/([\w]+)/);
      var type = matches[1][0] == "T" ? "track" : "album";
      module.exports.lookupId(matches[1], type).then(deferred.resolve);
    }
  });
  return deferred.promise;
}
