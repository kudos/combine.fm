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
  
  var path = "/videos?part=snippet%2Cstatus%2CtopicDetails&id=" + id + "&key=" + credentials.key;
  
  return request.get(apiRoot + path).promise().then(function(res) {
    var item = res.body.items[0];
    if (item.topicDetails.topicIds) {
      var promises = [];
      item.topicDetails.topicIds.forEach(function(topicId) {
        promises.push(freebase.get(topicId).then(function(topic) {
          return topic.property["/music/recording/song"] ? topic : false;
        }, function(err) {
          console.log(err)
        }));
      })
      return Promise.all(promises).then(function(topics) {
        for (var key in topics) {
          var topic = topics[key];
          if (topic) {
            console.log(topic.property['/music/recording/song'])
            return {
              id: id,
              service: "youtube",
              type: "track",
              name: topic.property['/music/recording/song'].values[0].text,
              artist: {name: topic.property['/music/recording/artist'].values[0].text},
              album: {name: ""},
              streamUrl: "https://youtu.be/" + id,
              purchaseUrl: null,
              artwork: {
                small: item.snippet.thumbnails.medium.url,
                large: item.snippet.thumbnails.high.url,
              }
            }
          }
        }
      });
    } else {
      return {service: "youtube"};
    }
  }, function(res) {
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
  });
};
