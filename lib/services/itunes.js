"use strict";
var parse = require('url').parse;
var request = require('superagent');
var Q = require('q');

module.exports.id = "itunes";

var apiRoot = "https://itunes.apple.com";

module.exports.match = function(url, type) {
  var parsed = parse(url);
  return parsed.host.match(/itunes.apple\.com$/);
};

module.exports.lookupId = function(id, type) {
  var deferred = Q.defer();
  var path = "/lookup?id=" + id;

  request.get(apiRoot + path, function(res) {
    var data = JSON.parse(res.text);

    if (!data.results || data.resultCount == 0 || !data.results[0].collectionId) {
      var error = new Error("Not Found");
      error.status = 404;
      deferred.reject(error);
    } else {
      var result = data.results[0];

      var item = {
        service: "itunes",
        type: type,
        id: result.collectionId,
        name: result.trackName ? result.trackName : result.collectionName,
        streamUrl: null,
        purchaseUrl: result.collectionViewUrl,
        artwork: "/itunes/" + result.artworkUrl100.replace("100x100", "200x200").replace("http://", ""),
        artist: {
          name: result.artistName
        }
      };

      if (type == "track") {
        item.album = {
          name: result.collectionName
        };
      }

      deferred.resolve(item);
    }
  });
  return deferred.promise;
}

module.exports.search = function(data) {
  var deferred = Q.defer();
  var query, album, entity;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
    album = data.name;
    entity = "album";
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
    album = data.album.name;
    entity = "musicTrack";
  }

  var path = "/search?term=" + encodeURIComponent(query) + "&media=music&entity=" + entity;
  request.get(apiRoot + path, function(res) {
    var result = JSON.parse(res.text);

    if (!result.results[0]) {
      var matches = album.match(/^[^\(\[]+/);
      if (matches[0] && matches[0] != album) {
        var cleanedData = JSON.parse(JSON.stringify(data));
        if (type == "album") {
          cleanedData.name = matches[0].trim();
        } else if (type == "track") {
          cleanedData.album = matches[0].trim();
        }
        module.exports.search(cleanedData).then(deferred.resolve);
      } else {
        deferred.resolve({service: "itunes"});
      }
    } else {
      var result = result.results[0];

      var item = {
        service: "itunes",
        type: type,
        id: result.collectionId,
        name: result.trackName ? result.trackName : result.collectionName,
        streamUrl: null,
        purchaseUrl: result.collectionViewUrl,
        artwork: "/itunes/" + result.artworkUrl100.replace("100x100", "200x200").replace("http://", ""),
        artist: {
          name: result.artistName
        }
      };

      if (type == "track") {
        item.album = {
          name: result.collectionName
        };
      }
      deferred.resolve(item);
    }
  });

  return deferred.promise;
}

module.exports.parseUrl = function(url) {
  var deferred = Q.defer();
  var matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)[\/]+([^\?]+)/);

  if (matches && matches[3]) {
    module.exports.lookupId(matches[3].substr(2), matches[1]).then(deferred.resolve);
  }
  return deferred.promise;
}
