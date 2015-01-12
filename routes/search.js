"use strict";
var parse = require('url').parse;
var path = require('path');
var lookup = require('../lib/lookup');
var services = require('../lib/services');

module.exports = function(req, res, next) {
  var url = parse(req.body.url);
  if (!url.host) {
    return res.json({error:{message:"You need to submit a url."}});
  }
  
  var promise = lookup(req.body.url);
  
  if (!promise) {
    return res.json({error: {message: "No supported music found at that link :("}});
  }
  
  promise.then(function(item) {
    if (!item) {
      return res.json({error: {message: "No supported music found at that link :("}});
    }
    item.matched_at = new Date();
    var matches = {};
    matches[item.service] = item;
    services.forEach(function(service) {
      if (service.id == item.service) {
        return;
      }
      matches[service.id] = {service: service.id};
      service.search(item).then(function(match) {
        match.matched_at = new Date();
        var update = {};
        update["services." + match.service] = match;
        req.db.matches.update({_id: item.service + "$$" + item.id}, {"$set": update});
      });
    });
    return req.db.matches.save({_id: item.service + "$$" + item.id, created_at: new Date(), services:matches}).then(function() {
      res.json(item);
    });
  }, function(error) {
    console.log(error.stack);
    res.json({error: {message: "No matches found for this link, sorry :("}});
  });
};
