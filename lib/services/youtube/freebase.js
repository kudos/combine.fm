"use strict";
var parse = require('url').parse;
var Promise = require('bluebird');
var request = require('superagent');
require('superagent-bluebird-promise');

var credentials = {
  key: process.env.YOUTUBE_KEY,
};

var apiRoot = "https://www.googleapis.com/freebase/v1/topic";

module.exports.get = function(topic) {
  return request.get(apiRoot + topic + "?key=" + credentials.key).promise().then(function(res) {
    return res.body;
  })
}


module.exports.get("/m/0dwcrm_");