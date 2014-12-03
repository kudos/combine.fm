"use strict";
var parse = require('url').parse;
var spotify = require('spotify');

module.exports.lookupId = function(id, type, next) {
  spotify.lookup({id: id, type: type}, function(err, data) {
    if ( err ) {
      console.log('Error occurred: ' + err);
      return;
    }

    var artist = data.artists[0];

    if (type == "album") {
      next({
        service: "spotify",
        type: type,
        id: data.id,
        name: data.name,
        url: "https://play.spotify.com/" + type + "/" + data.id,
        artwork: data.images ? data.images[0].url.replace("http:", "") : data.album.images[0].url.replace("http:", ""),
        artist: {
          name: artist.name
        }
      });
    } else if (type == "track") {
      next({
        service: "spotify",
        type: type,
        id: data.id,
        name: data.name,
        url: "https://play.spotify.com/" + type + "/" + data.id,
        artwork: data.images ? data.images[0].url.replace("http:", "") : data.album.images[0].url.replace("http:", ""),
        artist: {
          name: artist.name
        },
        album: {
          name: data.album.name
        }
      })
    }
  });
}

module.exports.search = function(data, next) {
  var query = "";
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.album.name + " " + data.name;
  }

  query = query.replace(":", "");

  spotify.search({query: query, type: type}, function(err, data) {
    if ( err ) {
      console.log('Error occurred: ' + err);
      return;
    }

    var item = data[type + "s"].items[0];

    module.exports.lookupId(item.id, type, next);
  });
}

module.exports.parseUrl = function(url, next) {
  var matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);

  if (matches && matches[2]) {
    module.exports.lookupId(matches[2], matches[1], next);
  }
}
