"use strict";
var parse = require('url').parse;

module.exports.match = function(url) {
  var parsed = parse(url);
  if (!parsed.host.match(/rd\.io$/) && !parsed.host.match(/rdio\.com$/)) {
    return false;
  }
  var matches = parsed.path.match(/[\/]*artist[\/]*([^\/]*)[\/]*album[\/]*([^\/]*)[\/]*([track]*)?[\/]*([^\/]*)/);
  return !!matches[2];
};
