"use strict";
var parse = require('url').parse;
var Promise = require('bluebird');
var request = require('superagent');
require('superagent-bluebird-promise');

module.exports.id = "youtube";

if (!process.env.YOUTUBE_KEY) {
  console.warn("YOUTUBE_KEY environment variable not found, deactivating Youtube.");
  return;
}

var credentials = {
  key: process.env.YOUTUBE_KEY,
};

var apiRoot = "https://www.googleapis.com/youtube/v3";

module.exports.match = require('./url').match;

module.exports.search = function(data) {
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
    album = data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.name;
    album = data.album.name
  }

  var path = "/search?part=snippet&q=" + encodeURIComponent(query) + "&type=video&videoCaption=any&videoCategoryId=10&key=" + credentials.key;

  return request.get(apiRoot + path).promise().then(function(res) {
    var result = res.body.items[0];

    if (!result) {
      return {service:"youtube", type: "video"};
    } else {
      return {
        service: "youtube",
        type: "video",
        id: result.id.videoId,
        name: result.snippet.title,
        streamUrl: "https://www.youtube.com/watch?v=" + result.id.videoId,
        purchaseUrl: null,
        artwork: result.snippet.thumbnails.medium.url,
      };
    }
  });
};
