"use strict";
var parse = require("url").parse;
var Promise = require('bluebird');
var querystring = require('querystring');
var request = require('superagent');
require('superagent-bluebird-promise');

module.exports.id = "itunes";

var apiRoot = "https://itunes.apple.com";

module.exports.match = require('./url').match;

module.exports.parseUrl = function(url) {
  var parsed = parse(url);
  var matches = parsed.path.match(/[\/]?([\/]?[a-z]{2}?)?[\/]+album[\/]+([^\/]+)[\/]+([^\?]+)/);
  var query = querystring.parse(parsed.query);

  if (matches) {
    var type = "album";
    var id = matches[3].substr(2);
    if (query.i) {
      type = "track";
      id = query.i;
    }
    return module.exports.lookupId(id, type, matches[1] || "us");
  } else {
    throw new Error();
  }
};

module.exports.lookupId = function(id, type, cc) {
  if (id.match(/^[a-z]{2}/)) {
    cc = id.substr(0,2);
    id = id.substr(2);
  }

  var path = "/lookup?id=" + id;
  if (cc) {
    path = "/" + cc + path;
  }

  return request.get(apiRoot + path).promise().then(function(res) {
    var data = JSON.parse(res.text);

    if (!data.results || data.resultCount == 0 || !data.results[0].collectionId) {
      var error = new Error("Not Found");
      error.status = 404;
      throw error;
    } else {
      var result = data.results[0];

      var item = {
        service: "itunes",
        type: type,
        id: cc + id,
        name: result.trackName ? result.trackName : result.collectionName,
        streamUrl: null,
        purchaseUrl: result.collectionViewUrl,
        artwork: "https://match.audio/itunes/" + result.artworkUrl100.replace("100x100", "200x200").replace("http://", ""),
        artist: {
          name: result.artistName
        }
      };

      if (type == "track") {
        item.album = {
          name: result.collectionName
        };
      }

      return item;
    }
  });
};

module.exports.search = function(data) {
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
  return request.get(apiRoot + path).promise().then(function(res) {
    var result = JSON.parse(res.text);

    if (!result.results[0]) {
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
        return {service: "itunes"};
      }
    } else {
      var result = result.results[0];

      var item = {
        service: "itunes",
        type: type,
        id: "us" + result.collectionId,
        name: result.trackName ? result.trackName : result.collectionName,
        streamUrl: null,
        purchaseUrl: result.collectionViewUrl,
        artwork: "https://match.audio/itunes/" + result.artworkUrl100.replace("100x100", "200x200").replace("http://", ""),
        artist: {
          name: result.artistName
        }
      };

      if (type == "track") {
        item.album = {
          name: result.collectionName
        };
      }
      return item;
    }
  });
};
