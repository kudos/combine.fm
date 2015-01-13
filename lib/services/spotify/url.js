"use strict";
var parse = require('url').parse;

module.exports.match = function(url, type) {
  var parsed = parse(url);
  if (!parsed.host.match(/spotify\.com$/)) {
    return false;
  }

  var matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);
  return matches && !!matches[2];
};
