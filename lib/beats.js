"use strict";
var parse = require('url').parse;
var request = require('superagent');

if (!process.env.BEATS_KEY || !process.env.BEATS_SECRET) {
  throw new Error("You need to set BEATS_KEY and BEATS_SECRET environment variables");
}

var credentials = {
  key: process.env.BEATS_KEY,
  secret: process.env.BEATS_SECRET
};

var apiRoot = "https://partner.api.beatsmusic.com/v1/api";

module.exports.lookupId = function(id, next) {
  if (id.substr(0,2) == "al") {
    request.get(apiRoot + "/albums/" + id + "/images/default?size=medium&client_id=" + credentials.key).redirects(0).end(function(res) {
      var artwork = res.headers.location;
      request.get(apiRoot + "/albums/" + id + "?client_id=" + credentials.key, function(res) {
        var result = res.body.data;
        next({
          service: "beats",
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
  } else if (id.substr(0,2) == "tr") {
    request.get(apiRoot + "/tracks/" + id + "?client_id=" + credentials.key, function(res) {
      var result = res.body.data;
      request.get(apiRoot + "/albums/" + result.refs.album.id + "/images/default?size=medium&client_id=" + credentials.key).redirects(0).end(function(res) {
        var artwork = res.headers.location;
        next({
          service: "beats",
          type: "track",
          id: result.id,
          name: result.title,
          url: "https://listen.beatsmusic.com/albums/" + result.refs.album.id + "/tracks/" + result.id,
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
};

module.exports.search = function(data, next) {
  var query;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
  }

  var path = "/search?q=" + encodeURIComponent(query) + "&type=" + type + "&client_id=" + credentials.key;
  request.get(apiRoot + path, function(res) {
    if (!res.body.data[0]) {
      next({service: "beats"});
    } else {
      module.exports.lookupId(res.body.data[0].id, next);
    }
  });
};

module.exports.parseUrl = function(url, next) {
  var matches = parse(url).path.match(/\/albums[\/]+([^\/]+)(\/tracks\/)?([^\/]+)?/);

  if (matches && matches[3]) {
    module.exports.lookupId(matches[3], next);
  } else if (matches && matches[1]) {
    module.exports.lookupId(matches[1], next);
  }
}
