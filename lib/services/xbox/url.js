"use strict";
var parse = require('url').parse;

module.exports.match = function(url, type) {
  var parsed = parse(url);

  if (!parsed.host.match(/music.xbox.com$/)) {
    return false;
  }

  var parts = parsed.path.split("/");

  return (parts[1] == "album" || parts[1] == "track") && parts[4];
};
