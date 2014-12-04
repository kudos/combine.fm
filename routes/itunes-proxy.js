"use strict";
var parse = require('url').parse;
var request = require('superagent');

module.exports = function(req, res) {
  var url = "http://" + req.url.substr(8);
  var parsed = parse(url);
  if (parsed.host.match(/mzstatic\.com/)) {
    request.get(url, function(response){
      res.set(response.headers);
      res.send(response.body);
    });
  }
};
