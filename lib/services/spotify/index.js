"use strict";
var parse = require('url').parse;
var Promise = require('bluebird');
var spotify = Promise.promisifyAll(require('spotify'));

module.exports.id = "spotify";

module.exports.match = require('./url').match;

module.exports.parseUrl = function(url) {
  var matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);

  if (matches && matches[2]) {
    return module.exports.lookupId(matches[2], matches[1]);
  }
}

module.exports.lookupId = function(id, type) {
  return spotify.lookupAsync({id: id, type: type}).then(function(data) {
    if (data.error) {
      var error = new Error("Not Found");
      error.status = 404;
      throw error;
    }

    var artist = data.artists[0];

    if (type == "album") {
      return {
        service: "spotify",
        type: type,
        id: data.id,
        name: data.name,
        streamUrl: "https://play.spotify.com/" + type + "/" + data.id,
        purchaseUrl: null,
        artwork: {
          small: data.images[1].url.replace("http:", "https:"),
          large: data.images[0].url.replace("http:", "https:"),
        },
        artist: {
          name: artist.name
        }
      };
    } else if (type == "track") {
      return {
        service: "spotify",
        type: type,
        id: data.id,
        name: data.name,
        streamUrl: "https://play.spotify.com/" + type + "/" + data.id,
        purchaseUrl: null,
        artwork: {
          small: data.album.images[1].url.replace("http:", "https:"),
          large: data.album.images[0].url.replace("http:", "https:"),
        },
        artist: {
          name: artist.name
        },
        album: {
          name: data.album.name
        }
      };
    }
  });
}

module.exports.search = function(data) {
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = "artist:" + data.artist.name.replace(":", "") + " album:" + data.name.replace(":", "");
    album = data.name;
  } else if (type == "track") {
    query = "artist:" + data.artist.name.replace(":", "") + " track:" + data.name.replace(":", "") + ( data.album.name.length > 0 ? " album: " + data.album.name.replace(":", ""): "");
    album = data.album.name;
  }

  return spotify.searchAsync({query: query, type: type}).then(function(results) {
    if (!results[type + "s"].items[0]) {
      var matches = album.match(/^[^\(\[]+/);
      if (matches && matches[0] && matches[0] != album) {
        var cleanedData = JSON.parse(JSON.stringify(data));
        if (type == "album") {
          cleanedData.name = matches[0].trim();
        } else if (type == "track") {
          cleanedData.album.name = matches[0].trim();
        }
        return module.exports.search(cleanedData);
      } else {
        return {service: "spotify"};
      }
    } else {
      return module.exports.lookupId(results[type + "s"].items[0].id, type);
    }

  });
}
