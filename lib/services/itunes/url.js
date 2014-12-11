"use strict";
var parse = require('url').parse;

module.exports.match = function(url, type) {
  var parsed = parse(url);

  if (!parsed.host.match(/itunes.apple\.com$/)) {
    return false;
  }

  var matches = parsed.path.match(/[\/]?([\/]?[a-z]{2}?)?[\/]+album[\/]+([^\/]+)[\/]+([^\?]+)/);
  var query = querystring.parse(parsed.query);

  return !!matches[3];
};
