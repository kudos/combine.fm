"use strict";
var parse = require("url").parse;
var Promise = require('bluebird');
var PlayMusic = require('../../playmusic');
var pm = Promise.promisifyAll(new PlayMusic());

module.exports.id = "google";

if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
  console.warn("GOOGLE_EMAIL or GOOGLE_PASSWORD environment variables not found, deactivating Google Play Music.");
  return;
}

var ready = pm.initAsync({email: process.env.GOOGLE_EMAIL, password: process.env.GOOGLE_PASSWORD}).catch(function(err) {
  console.log(err)
});

module.exports.match = require('./url').match;

module.exports.parseUrl = function(url) {
  return ready.then(function() {
    var parsed = parse(url.replace(/\+/g, "%20"));
    var path = parsed.path;
    var hash = parsed.hash;
    if (hash) {
      var parts = hash.split("/");
      var type = parts[1];
      var id = parts[2];
      var artist = decodeURIComponent(parts[3]);
      var album = decodeURIComponent(parts[4]);
      
      if (type != "album" && type != "track") {
        return false;
      }
      
      if (id.length > 0) {
        return {id: id, type: type};
      } else {
        return module.exports.search({type: type, name:album, artist: {name: artist}});
      }
    } else if(path) {
      var matches = path.match(/\/music\/m\/([\w]+)/);
      var type = matches[1][0] == "T" ? "track" : "album";
      return module.exports.lookupId(matches[1], type);
    }
    return false;
  })
}

module.exports.lookupId = function(id, type) {
  return ready.then(function() {
    if (type == "album") {
      return pm.getAlbumAsync(id, false).then(function(album) {
        return {
          service: "google",
          type: "album",
          id: album.albumId,
          name: album.name,
          streamUrl: "https://play.google.com/music/listen#/album/" + album.albumId,
          purchaseUrl: "https://play.google.com/store/music/album?id=" + album.albumId,
          artwork: {
            small: album.albumArtRef.replace("http:", "https:"),
            large: album.albumArtRef.replace("http:", "https:")
          },
          artist: {
            name: album.artist
          }
        };
      }, function(error) {
        throw error;
      });
    } else if (type == "track") {
      return pm.getTrackAsync(id).then(function(track) {
        return {
          service: "google",
          type: "track",
          id: track.nid,
          name: track.title,
          streamUrl: "https://play.google.com/music/listen#/track/" + track.nid + "/" + track.albumId,
          purchaseUrl: "https://play.google.com/store/music/album?id=" + track.albumId,
          artwork: {
            small: track.albumArtRef[0].url.replace("http:", "https:"),
            large: track.albumArtRef[0].url.replace("http:", "https:")
          },
          album: {
            name: track.album
          },
          artist: {
            name: track.artist
          }
        };
      }, function(error) {
        throw error;
      });
    }
  });
}

module.exports.search = function(data) {
  return ready.then(function() {
    var query, album;
    var type = data.type;

    if (type == "album") {
      query = data.artist.name + " " + data.name;
      album = data.name;
    } else if (type == "track") {
      query = data.artist.name + " " + data.album.name + " " + data.name;
      album = data.album.name;
    }

    return pm.searchAsync(query, 5).then(function(result) {
      
      if (!result.entries) {
        var matches = album.match(/^[^\(\[]+/);
        if (matches[0] && matches[0] != album) {
          var cleanedData = JSON.parse(JSON.stringify(data));
          if (type == "album") {
            cleanedData.name = matches[0].trim();
          } else if (type == "track") {
            cleanedData.album.name = matches[0].trim();
          }
          return module.exports.search(cleanedData);
        } else {
          return {service: "googleplaymusic"};
        }
      }
      var result = result.entries.filter(function(result) {
        return result[type];
      }).sort(function(a, b) { // sort by match score
        return a.score < b.score;
      }).shift();

      if (!result) {
        return {service: "google"};
      } else {
        var id;
        if (type == "album") {
          id = result.album.albumId;
        } else if (type == "track") {
          id = result.track.nid;
        }

        return module.exports.lookupId(id, type);
      }
    });
  });
}
