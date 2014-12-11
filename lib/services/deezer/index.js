"use strict";
var parse = require('url').parse;
var request = require('superagent');
var Q = require('q');

module.exports.id = "deezer";

var apiRoot = "https://api.deezer.com";

module.exports.match = require('./url').match;

module.exports.parseUrl = function(url, next) {
  var deferred = Q.defer();
  var matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);

  if (matches && matches[2]) {
    module.exports.lookupId(matches[2], matches[1]).then(deferred.resolve);
  } else {
    deferred.reject();
  }
  return deferred.promise;
}

module.exports.lookupId = function(id, type) {
  var deferred = Q.defer();
  var path = "/" + type + "/" + id;

  request.get(apiRoot + path, function(res) {
    var result = res.body;
    if (res.body.error) {
      var error = new Error("Not Found");
      error.status = 404;
      deferred.reject(error);
      return;
    }
    var cover = result.cover || result.album.cover;
    request.get(cover).redirects(0).end(function(res) {
      var artwork = res.headers.location.replace("120x120", "200x200");
      if (type == "album") {
        deferred.resolve({
          service: "deezer",
          type: type,
          id: result.id,
          name: result.title,
          streamUrl: result.link,
          purchaseUrl: null,
          artwork: artwork,
          artist: {
            name: result.artist.name
          },
        });
      } else if (type == "track") {
        deferred.resolve({
          service: "deezer",
          type: type,
          id: result.id,
          name: result.title,
          streamUrl: result.album.link,
          purchaseUrl: null,
          artwork: artwork,
          artist: {
            name: result.artist.name
          },
          album: {
            name: result.album.title
          }
        });
      };
    });
  });
  return deferred.promise;
};

module.exports.search = function(data, next) {
  var deferred = Q.defer();
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
    album = data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
    album = data.album.name;
  }

  var path = "/search/" + type + "?q=" + encodeURIComponent(query);
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
        deferred.resolve({service: "deezer"});
      }
    } else {
      module.exports.lookupId(res.body.data[0].id, type).then(deferred.resolve);
    }
  });
  return deferred.promise;
};
