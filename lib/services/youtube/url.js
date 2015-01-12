"use strict";
var parse = require("url").parse;
var querystring = require('querystring');

module.exports.match = function(url, type) {
  var parsed = parse(url);
  
  if (parsed.host.match(/youtu\.be$/)) {
    return true;
  } else if (parsed.host.match(/youtube\.com$/)) {
    var query = querystring.parse(parsed.query);
    return !!query.v;
  }
  return false;
};
