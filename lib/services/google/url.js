"use strict";
var parse = require('url').parse;

module.exports.match = function(url) {
  var parsed = parse(url.replace(/\+/g, "%20"));
  if (!parsed.host.match(/play\.google\.com$/)) {
    return false;
  }

  var path = parsed.path;
  var hash = parsed.hash;

  if (hash) {
    var parts = hash.split("/");
    var id = parts[2];
    var artist = parts[3];

    if (id.length > 0) {
      return true;
    } else if (artist.length > 0) {
      return true;
    }
  } else if(path) {
    var matches = path.match(/\/music\/m\/([\w]+)/);
    if (matches[1]) {
      return true
    }
  }
  return false
};
