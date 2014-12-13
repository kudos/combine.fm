"use strict";
var parse = require('url').parse;
var Promise = require('bluebird');
var request = require('superagent');
require('superagent-bluebird-promise');

module.exports.id = "deezer";

var apiRoot = "https://api.deezer.com";

module.exports.match = require('./url').match;

module.exports.parseUrl = function(url) {
  var matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);

  if (matches && matches[2]) {
    return module.exports.lookupId(matches[2], matches[1]);
  } else {
    throw new Error();
  }
}

module.exports.lookupId = function(id, type) {
  var path = "/" + type + "/" + id;

  return request.get(apiRoot + path).promise().then(function(res) {
    var result = res.body;
    if (res.body.error) {
      var error = new Error("Not Found");
      error.status = 404;
      throw error;
    }
    var cover = result.cover || result.album.cover;
    return request.get(cover).redirects(0).promise().then(function(res) {
      var artwork = {
        small: res.headers.location.replace("120x120", "200x200"),
        large: res.headers.location.replace("120x120", "800x800")
      };
      if (type == "album") {
        return {
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
        };
      } else if (type == "track") {
        return {
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
        };
      } else {
        throw new Error();
      }
    });
  });
};

module.exports.search = function(data) {
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
  return request.get(apiRoot + path).promise().then(function(res) {
    if (!res.body.data[0]) {
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
        return {service: "deezer"};
      }
    } else {
      return module.exports.lookupId(res.body.data[0].id, type);
    }
  });
};
