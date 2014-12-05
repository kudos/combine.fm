"use strict";
var parse = require('url').parse;
var spotify = require('spotify');
var Q = require('q');

module.exports.id = "spotify";

module.exports.match = function(url, type) {
  var parsed = parse(url);
  return parsed.host.match(/spotify\.com$/);
};

module.exports.lookupId = function(id, type) {
  var deferred = Q.defer();
  spotify.lookup({id: id, type: type}, function(err, data) {
    if ( err || data.error) {
      var error = new Error("Not Found");
      error.status = 404;
      deferred.reject(error);
      return;
    }

    var artist = data.artists[0];

    if (type == "album") {
      deferred.resolve({
        service: "spotify",
        type: type,
        id: data.id,
        name: data.name,
        streamUrl: "https://play.spotify.com/" + type + "/" + data.id,
        purchaseUrl: null,
        artwork: data.images ? data.images[1].url.replace("http:", "") : data.album.images[1].url.replace("http:", ""),
        artist: {
          name: artist.name
        }
      });
    } else if (type == "track") {
      deferred.resolve({
        service: "spotify",
        type: type,
        id: data.id,
        name: data.name,
        streamUrl: "https://play.spotify.com/" + type + "/" + data.id,
        purchaseUrl: null,
        artwork: data.images ? data.images[1].url.replace("http:", "") : data.album.images[1].url.replace("http:", ""),
        artist: {
          name: artist.name
        },
        album: {
          name: data.album.name
        }
      })
    }
  });
  return deferred.promise;
}

module.exports.search = function(data) {
  var deferred = Q.defer();
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = "artist:" + data.artist.name.replace(":", "") + " album:" + data.name.replace(":", "");
    album = data.name;
  } else if (type == "track") {
    query = "artist:" + data.artist.name.replace(":", "") + " album:" + data.album.name.replace(":", "") + " track:" + data.name.replace(":", "");
    album = data.album.name;
  }

  spotify.search({query: query, type: type}, function(err, data) {
    if ( err ) {
      deferred.resolve({service: "spotify"});
      return;
    }

    if (!data[type + "s"].items[0]) {
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
        deferred.resolve({service: "spotify"});
      }
    } else {
      module.exports.lookupId(data[type + "s"].items[0].id, type).then(deferred.resolve);
    }

  });
  return deferred.promise;
}

module.exports.parseUrl = function(url) {
  var deferred = Q.defer();
  var matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);

  if (matches && matches[2]) {
    module.exports.lookupId(matches[2], matches[1]).then(deferred.resolve);
  }
  return deferred.promise;
}
