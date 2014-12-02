"use strict";
var parse = require('url').parse;

if (!process.env.RDIO_API_KEY || !process.env.RDIO_API_SHARED) {
  throw new Error("You need to set RDIO_API_KEY and RDIO_API_SHARED environment variables");
}


var rdio = require('rdio')({
  rdio_api_key: process.env.RDIO_API_KEY,
  rdio_api_shared: process.env.RDIO_API_SHARED,
});

module.exports.lookupId = function(id, next) {
  rdio.api("", "", {
    method: 'getObjectFromShortCode',
    short_code: id,
  }, function(err, results) {
    var result = JSON.parse(results).result;
    var parsed = parse(result.shortUrl)
    var id = parsed.path.replace("/x/", "").replace("/", "");
    var type = result.album ? "track" : "album";
    next({
      id: id,
      name: result.name,
      url: result.shortUrl,
      artwork: result.icon.replace("http:", ""),
      artist: {
        name: result.artist
      },
      type: type
    });
  });
};

module.exports.lookupUrl = function(url, next) {
  var parsed = parse(url);

  var data;

  if (parsed.host == "rd.io") {
    data = {
      method: 'getObjectFromShortCode',
      short_code: parsed.path.replace("/x/", "").replace("/", ""),
    };
  } else if (parsed.host.match(/rdio\.com$/)) {
    data = {
      method: 'getObjectFromUrl',
      url: parsed.path,
    };
  } else {
    return;
  }

  rdio.api("", "", data, function(err, results) {
    var result = JSON.parse(results).result;
    var parsed = parse(result.shortUrl)
    var id = parsed.path.replace("/x/", "").replace("/", "");
    var type = result.album ? "track" : "album";
    next({
      id: id,
      name: result.name,
      url: result.shortUrl,
      artwork: result.icon.replace("http:", ""),
      artist: {
        name: result.artist
      },
      type: type
    });
  });
};

module.exports.search = function(query, type, next) {
  rdio.api("", "", {
    query: query,
    method: 'search',
    types: type,
  }, function(err, results) {
    var result = JSON.parse(results).result.results[0];
    if (!result) {
      return next({});
    }
    var parsed = parse(result.shortUrl)
    var id = parsed.path.replace("/x/", "").replace("/", "");
    next({
      id: id,
      name: result.name,
      url: result.shortUrl,
      artwork: result.icon.replace("http:", ""),
      artist: {
        name: result.artist
      },
      type: type
    });
  });
};
