"use strict";
var parse = require('url').parse;
var Promise = require('bluebird');
var request = require('superagent');
require('superagent-bluebird-promise');

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
  var matches = parse(url).path.match(/\/albums[\/]+([^\/]+)(\/tracks\/)?([^\/]+)?/);
  if (matches && matches[3]) {
    return module.exports.lookupId(matches[3], "track");
  } else if (matches && matches[1]) {
    return module.exports.lookupId(matches[1], "album");
  } else {
    throw new Error("Url does not match");
  }
}

module.exports.lookupId = function(id, type) {
  if (type == "album") {
    return request.get(apiRoot + "/albums/" + id + "/images/default?size=large&client_id=" + credentials.key).redirects(0).promise().then(function(res) {
      var artwork = {large: res.headers.location.replace("http:", "https:")};
      return request.get(apiRoot + "/albums/" + id + "/images/default?client_id=" + credentials.key).redirects(0).promise().then(function(res) {
        artwork.small = res.headers.location.replace("http:", "https:");
        return request.get(apiRoot + "/albums/" + id + "?client_id=" + credentials.key).promise().then(function(res) {
          if (!res.body.data) {
            var error = new Error("Not Found");
            error.status = 404;
            throw error;
          }
          var result = res.body.data;
          return {
            service: "beats",
            type: "album",
            id: result.id,
            name: result.title,
            streamUrl: "https://listen.beatsmusic.com/albums/" + result.id,
            purchaseUrl: null,
            artwork: artwork,
            artist: {
              name: result.artist_display_name
            }
          };
        });
      });
    });
  } else if (type == "track") {
    return request.get(apiRoot + "/tracks/" + id + "?client_id=" + credentials.key).promise().then(function(res) {
      if (!res.body.data) {
        var error = new Error("Not Found");
        error.status = 404;
        throw error;
      }
      var result = res.body.data;
      return request.get(apiRoot + "/albums/" + result.refs.album.id + "/images/default?size=large&client_id=" + credentials.key).redirects(0).promise().then(function(res) {
        var artwork = {large: res.headers.location.replace("http:", "https:")};
        return request.get(apiRoot + "/albums/" + result.refs.album.id + "/images/default?client_id=" + credentials.key).redirects(0).promise().then(function(res) {
          artwork.small = res.headers.location.replace("http:", "https:");
          return {
            service: "beats",
            type: "track",
            id: result.id,
            name: result.title,
            streamUrl: "https://listen.beatsmusic.com/albums/" + result.refs.album.id + "/tracks/" + result.id,
            purchaseUrl: null,
            artwork: artwork,
            artist: {
              name: result.artist_display_name
            },
            album: {
              name: result.refs.album.display
            }
          };
        });
      });
    });
  } else {
    var error = new Error("Not Found");
    error.status = 404;
    return error;
  }
};

module.exports.search = function(data) {
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = '"' + data.artist.name + '" "' + data.name + '"';
    album = data.name;
  } else if (type == "track") {
    query = '"' + data.artist.name + '" "' + data.name + '"';
    album = data.album.name
  }

  var path = "/search?q=" + encodeURIComponent(query) + "&type=" + type + "&client_id=" + credentials.key;

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
        return {service: "beats"};
      }
    } else {
      //insist on at least album or artist name being exactly right
      return module.exports.lookupId(res.body.data[0].id, type);
    }
  });
};
