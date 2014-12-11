"use strict";
var parse = require('url').parse;

module.exports.match = function(url) {
  var parsed = parse(url);
  if (!parsed.host.match(/beatsmusic\.com$/)) {
    return false;
  }
  var matches = parsed.path.match(/\/albums[\/]+([^\/]+)(\/tracks\/)?([^\/]+)?/);
  return matches.length > 1;
};
