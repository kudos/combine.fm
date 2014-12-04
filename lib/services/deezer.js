"use strict";
var parse = require('url').parse;
var request = require('superagent');
var Q = require('q');

module.exports.id = "deezer";

var apiRoot = "https://api.deezer.com";

module.exports.match = function(url, type) {
  var parsed = parse(url);
  return parsed.host.match(/deezer\.com$/);
};

module.exports.lookupId = function(id, type) {
  var deferred = Q.defer();
  var path = "/" + type + "/" + id;

  request.get(apiRoot + path, function(res) {
    var result = res.body;
    var cover = result.cover || result.album.cover;
    request.get(cover).redirects(0).end(function(res) {
      var artwork = res.headers.location.replace("120x120", "200x200");
      if (type == "album") {
        deferred.resolve({
          service: "deezer",
          type: type,
          id: result.id,
          name: result.title,
          url: result.link,
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
          url: result.link,
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
  var query;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
  }

  var path = "/search/" + type + "?q=" + encodeURIComponent(query);
  request.get(apiRoot + path, function(res) {
    if (!res.body.data[0]) {
      deferred.resolve({service: "deezer"});
    } else {
      module.exports.lookupId(res.body.data[0].id, type).then(deferred.resolve);
    }
  });
  return deferred.promise;
};

module.exports.parseUrl = function(url, next) {
  var deferred = Q.defer();
  var matches = parse(url).path.match(/\/albums[\/]+([^\/]+)(\/tracks\/)?([^\/]+)?/);

  if (matches && matches[3]) {
    module.exports.lookupId(matches[3]).then(deferred.resolve);
  } else if (matches && matches[1]) {
    module.exports.lookupId(matches[1]).then(deferred.resolve);
  }
  return deferred.promise;
}
