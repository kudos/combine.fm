"use strict";

var React = require('react');
var nodejsx = require('node-jsx').install({extension: '.jsx'});
var Router = require('react-router');
var routes = require('../views/app.jsx').routes;

module.exports = function(req, res, next) {

  req.db.matches.find().sort({created_at:-1}).limit(6).toArray().then(function(docs){
    var recents = [];
    docs.forEach(function(doc) {
      var shares = Object.keys(doc.services).map(function (key) {return doc.services[key]});
      shares.some(function(item) {
        if (item.service == doc._id.split("$$")[0]) {
          recents.push(item);
          return false;
        }
      });
    });

    Router.run(routes, req.url, function (Handler) {
      var App = React.createFactory(Handler);
      var content = React.renderToString(new App({recents: recents}));
      res.send('<!doctype html>\n' + content.replace("</body></html>", "<script>var recents = " + JSON.stringify(recents) + "</script></body></html>"));
    });
  }).catch(function(error) {
    next(error);
  });
}