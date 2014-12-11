"use strict";
var parse = require('url').parse;

module.exports.match = function(url) {
  var parsed = parse(url);
  if (!parsed.host.match(/deezer\.com$/)) {
    return false;
  }
  var matches = parsed.path.match(/\/(album|track)[\/]+([^\/]+)/);
  return matches.length > 1;
};
