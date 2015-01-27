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
  var cleanParam = function(str) {
    var chopChars = ['&', '[', '('];
    chopChars.forEach(function(chr) {
      if (data.artist.name.indexOf('&') > 0) {
        str = str.substring(0, data.artist.name.indexOf(chr));
      }
    })
    return str.replace(/[\:\?]+/, "");
  }
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = "artist:" + cleanParam(data.artist.name) + " album:" + cleanParam(data.name);
    album = data.name;
  } else if (type == "track") {
    query = "artist:" + cleanParam(data.artist.name) + " track:" + cleanParam(data.name) + ( cleanParam(data.album.name).length > 0 ? " album:" + cleanParam(data.album.name): "");
    album = data.album.name;
  }

  return spotify.searchAsync({query: query, type: type}).then(function(results) {
    if (!results[type + "s"].items[0]) {
      return {service: "spotify"};
    } else {
      var found;
      var choppedAlbum = data.type == "album" ? cleanParam(data.name) : cleanParam(data.album.name);
      if (!choppedAlbum.length) {
        return module.exports.lookupId(results[type + "s"].items[0].id, type);
      }
      
      results[type + "s"].items.forEach(function(item) {
        var albumName = data.type == "album" ? item.name : item.album.name;
        var matches = albumName.match(/^[^\(\[]+/);
        if(choppedAlbum.indexOf(matches[0]) >= 0) {
          found = item;
        }
      });
      if (!found) {
        return {service: "spotify"};
      }
      return module.exports.lookupId(results[type + "s"].items[0].id, type);
    }

  });
}
