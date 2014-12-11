"use strict";
var parse = require('url').parse;
var request = require('superagent');
var Q = require('q');

module.exports.id = "beats";

if (!process.env.BEATS_KEY || !process.env.BEATS_SECRET) {
  console.warn("BEATS_KEY or BEATS_SECRET environment variables not found, deactivating Beats.");
  return;
}

var credentials = {
  key: process.env.BEATS_KEY,
  secret: process.env.BEATS_SECRET
};

var apiRoot = "https://partner.api.beatsmusic.com/v1/api";

module.exports.match = require("./url").match;

module.exports.parseUrl = function(url) {
  var deferred = Q.defer();
  var matches = parse(url).path.match(/\/albums[\/]+([^\/]+)(\/tracks\/)?([^\/]+)?/);
  if (matches && matches[3]) {
    module.exports.lookupId(matches[3], "track").then(deferred.resolve);
  } else if (matches && matches[1]) {
    module.exports.lookupId(matches[1], "album").then(deferred.resolve);
  } else {
    deferred.reject();
  }
  return deferred.promise;
}

module.exports.lookupId = function(id, type) {
  var deferred = Q.defer();

  if (type == "album") {
    request.get(apiRoot + "/albums/" + id + "/images/default?size=medium&client_id=" + credentials.key).redirects(0).end(function(res) {
      var artwork = res.headers.location;
      request.get(apiRoot + "/albums/" + id + "?client_id=" + credentials.key, function(res) {
        if (!res.body.data) {
          var error = new Error("Not Found");
          error.status = 404;
          return deferred.reject(error);
        }
        var result = res.body.data;
        deferred.resolve({
          service: "beats",
          type: "album",
          id: result.id,
          name: result.title,
          streamUrl: "https://listen.beatsmusic.com/albums/" + result.id,
          purchaseUrl: null,
          artwork: artwork.replace("http:", "https:"),
          artist: {
            name: result.artist_display_name
          }
        });
      });
    });
  } else if (type == "track") {
    request.get(apiRoot + "/tracks/" + id + "?client_id=" + credentials.key, function(res) {
      if (!res.body.data) {
        var error = new Error("Not Found");
        error.status = 404;
        return deferred.reject(error);
      }
      var result = res.body.data;
      request.get(apiRoot + "/albums/" + result.refs.album.id + "/images/default?size=medium&client_id=" + credentials.key).redirects(0).end(function(res) {
        var artwork = res.headers.location;
        deferred.resolve({
          service: "beats",
          type: "track",
          id: result.id,
          name: result.title,
          streamUrl: "https://listen.beatsmusic.com/albums/" + result.refs.album.id + "/tracks/" + result.id,
          purchaseUrl: null,
          artwork: artwork.replace("http:", "https:"),
          artist: {
            name: result.artist_display_name
          },
          album: {
            name: result.refs.album.display
          }
        });
      });
    });
  } else {
    var error = new Error("Not Found");
    error.status = 404;
    deferred.reject(error);
  }
  return deferred.promise;
};

module.exports.search = function(data) {
  var deferred = Q.defer();
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
    album = data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
    album = data.album.name
  }

  var path = "/search?q=" + encodeURIComponent(query) + "&type=" + type + "&client_id=" + credentials.key;
  request.get(apiRoot + path, function(res) {
    if (!res.body.data[0]) {
      var matches = album.match(/^[^\(\[]+/);
      if (matches[0] && matches[0] != album) {
        var cleanedData = JSON.parse(JSON.stringify(data));
        if (type == "album") {
          cleanedData.name = matches[0].trim();
        } else if (type == "track") {
          cleanedData.album.name = matches[0].trim();
        }
        module.exports.search(cleanedData).then(deferred.resolve);
      } else {
        deferred.resolve({service: "beats"});
      }
    } else {
      module.exports.lookupId(res.body.data[0].id, type).then(deferred.resolve);
    }
  });
  return deferred.promise;
};
