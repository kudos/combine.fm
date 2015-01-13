"use strict";
var parse = require('url').parse;
var freebase = require('./freebase');
var querystring = require('querystring');
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

module.exports.parseUrl = function(url) {
  var parsed = parse(url);
  var query = querystring.parse(parsed.query);
  var id = query.v;
  
  if (!id) {
    id = parsed.path.substr(1);
    if (!id) {
      throw new Error();
    }
  }
  return module.exports.lookupId(id, "track");
}

module.exports.lookupId = function(id, type) {
  
  var path = "/videos?part=snippet%2CtopicDetails&id=" + id + "&key=" + credentials.key;
  
  return request.get(apiRoot + path).promise().then(function(res) {
    var item = res.body.items[0];
    if (item.topicDetails.topicIds) {
      var promises = [];
      var match = {
        id: id,
        service: "youtube",
        name: item.snippet.title,
        type: "track",
        album: {name: ""},
        streamUrl: "https://youtu.be/" + id,
        purchaseUrl: null,
        artwork: {
          small: item.snippet.thumbnails.medium.url,
          large: item.snippet.thumbnails.high.url,
        }
      };
      item.topicDetails.topicIds.forEach(function(topicId) {
        promises.push(freebase.get(topicId).then(function(topic) {
          if (topic.property["/type/object/type"].values.some(function(value) {
              return value.text == "Musical Artist";
              })) {
            match.artist = {name: topic.property["/type/object/name"].values[0].text};
          } else if (topic.property["/type/object/type"].values.some(function(value) {
              return value.text == "Musical Recording";
              })) {
            if (!match.name) {
              match.album = {name: topic.property["/music/recording/releases"].values[0].text};
              match.name = topic.property["/type/object/name"].values[0].text;
              match.type = "track";
            }
          } else if (topic.property["/type/object/type"].values.some(function(value) {
              return value.text == "Musical Album";
              })) {
            match.name = topic.property["/type/object/name"].values[0].text;
            match.type = "album";
          }
        }, function(err) {
          console.log(err)
        }));
      });
      return Promise.all(promises).then(function() {
        return match;
      }, function(err) {
        console.log(err)
        return {service: "youtube"};
      });
    } else {
      return {service: "youtube"};
    }
  }, function(err) {
    console.log(err)
    return {service: "youtube"};
  });
};

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
        artwork: {
          small: result.snippet.thumbnails.medium.url,
          large: result.snippet.thumbnails.high.url,
        }
      };
    }
  }, function(err) {
    console.log(err)
    return {service: "youtube"};
  });
};
