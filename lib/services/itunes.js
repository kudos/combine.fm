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
  if (type == "album") {
    request.get(apiRoot + "/albums/" + id + "/images/default?size=medium&client_id=" + credentials.key).redirects(0).end(function(res) {
      var artwork = res.headers.location;
      request.get(apiRoot + "/albums/" + id + "?client_id=" + credentials.key, function(res) {
        var result = res.body.data;
        deferred.resolve({
          service: "itunes",
          type: "album",
          id: result.id,
          name: result.title,
          url: "https://listen.beatsmusic.com/albums/" + result.id,
          artwork: artwork,
          artist: {
            name: result.artist_display_name
          }
        });
      });
    });
  } else if (type == "track") {
    request.get(apiRoot + "/tracks/" + id + "?client_id=" + credentials.key, function(res) {
      var result = res.body.data;
      request.get(apiRoot + "/albums/" + result.refs.album.id + "/images/default?size=medium&client_id=" + credentials.key).redirects(0).end(function(res) {
        var artwork = res.headers.location;
        deferred.resolve({
          service: "itunes",
          type: "track",
          id: result.id,
          name: result.title,
          purchaseUrl: "https://listen.beatsmusic.com/albums/" + result.refs.album.id + "/tracks/" + result.id,
          streamUrl: null,
          artwork: artwork,
          artist: {
            name: result.artist_display_name
          },
          album: {
            name: result.refs.album.display
          }
        });
      });
    });
  }
  return deferred.promise;
}

module.exports.search = function(data) {
  var deferred = Q.defer();
  var query = "";
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
  }

  var path = "/search?term=" + encodeURIComponent(query) + "&media=music&entity=album"
  request.get(apiRoot + path, function(res) {
    var data = JSON.parse(res.text);
    if (!data.results[0].collectionId) {
      deferred.resolve({service: "itunes"});
    } else {
      var result = data.results[0];

      deferred.resolve({
        service: "itunes",
        type: type,
        id: result.collectionId,
        name: result.collectionName,
        streamUrl: null,
        purchaseUrl: result.collectionViewUrl,
        artwork: result.artworkUrl100.replace("100x100", "200x200"),
        artist: {
          name: result.artistName
        }
      });
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
