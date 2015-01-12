"use strict";
var parse = require('url').parse;
var Promise = require('bluebird');

module.exports.id = "rdio";

if (!process.env.RDIO_API_KEY || !process.env.RDIO_API_SHARED) {
  console.warn("RDIO_API_KEY or RDIO_API_SHARED environment variables not found, deactivating Rdio.");
  return;
}

var rdio = require('rdio')({
  rdio_api_key: process.env.RDIO_API_KEY,
  rdio_api_shared: process.env.RDIO_API_SHARED,
});

var rdio = Promise.promisifyAll(rdio);

module.exports.match = require('./url').match;

module.exports.lookupId = function(id) {
  return rdio.apiAsync("", "", {method: 'getObjectFromShortCode', short_code: id}).then(function(results) {
    if (!JSON.parse(results[0]).result) {
      var error = new Error("Not Found");
      error.status = 404;
      throw error;
    }
    var result = JSON.parse(results[0]).result;
    var parsed = parse(result.shortUrl)
    var id = parsed.path.replace("/x/", "").replace("/", "");
    var type = result.album ? "track" : "album";

    var item = {
      service: "rdio",
      type: type,
      id: id,
      name: result.name,
      streamUrl: result.shortUrl,
      purchaseUrl: null,
      artwork: {
        small: result.icon.replace("square-200", "square-250").replace("http:", "https:"),
        large: result.icon.replace("square-200", "square-600").replace("http:", "https:")
      },
      artist: {
        name: result.artist
      }
    };
    if (type == "track") {
      item.album = {
        name: result.album
      };
    }
    return item;
  });
};

module.exports.parseUrl = function(url) {
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
    var error = new Error("Not Found");
    error.status = 404;
    throw error;
  }

  return rdio.apiAsync("", "", data).then(function(results) {
    var results = JSON.parse(results[0]);
    var result = results.result;
    if (!result || results.status != "ok") {
      var error = new Error("Not Found");
      error.status = 404;
      throw error;
    } else {
      var parsed = parse(result.shortUrl)
      var id = parsed.path.replace("/x/", "").replace("/", "");
      var type = result.album ? "track" : "album";
      var item = {
        service: "rdio",
        type: type,
        id: id,
        name: result.name,
        streamUrl: result.shortUrl,
        purchaseUrl: null,
        artwork: {
          small: result.icon.replace("square-200", "square-250").replace("http:", "https:"),
          large: result.icon.replace("square-200", "square-600").replace("http:", "https:")
        },
        artist: {
          name: result.artist
        }
      };
      if (type == "track") {
        item.album = {
          name: result.album
        };
      }
      return item;
    }
  });
};

module.exports.search = function(data) {
  var query, albumClean;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
    albumClean = data.name.match(/([^\(\[]+)/)[0];
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
    try {
      albumClean = data.album.name.match(/([^\(\[]+)/)[0];
    } catch(e) {
      albumClean = "";
    }
  }

  return rdio.apiAsync("", "", {query: query, method: 'search', types: type}).then(function(results) {
    var results = JSON.parse(results[0]).result.results;

    var result = results.filter(function(result) {
      if (type == "album" && result.name.match(/([^\(\[]+)/)[0] == albumClean) {
        return result;
      } else if (type == "track" && (result.album.match(/([^\(\[]+)/)[0] == albumClean || !albumClean)) {
        return result;
      }
    }).shift();

    if (!result) {
      var matches = albumClean.match(/^[^\(\[]+/);
      if (matches && matches[0] && matches[0] != albumClean) {
        var cleanedData = JSON.parse(JSON.stringify(data));
        if (type == "album") {
          cleanedData.name = matches[0].trim();
        } else if (type == "track") {
          cleanedData.album.name = matches[0].trim();
        }
        return module.exports.search(cleanedData);
      } else {
        return {service: "rdio"};
      }
    } else {
      var parsed = parse(result.shortUrl)
      var id = parsed.path.replace("/x/", "").replace("/", "");
      var item = {
        service: "rdio",
        type: type,
        id: id,
        name: result.name,
        streamUrl: result.shortUrl,
        purchaseUrl: null,
        artwork: {
          small: result.icon.replace("square-200", "square-250").replace("http:", "https:"),
          large: result.icon.replace("square-200", "square-600").replace("http:", "https:")
        },
        artist: {
          name: result.artist
        }
      };
      if (type == "track") {
        item.album = {
          name: result.album
        };
      }
      return item;
    }
  });
};
