"use strict";

var React = require('react');
var nodejsx = require('node-jsx').install({extension: '.jsx'});
var Router = require('react-router');
var routes = require('../views/app.jsx').routes;

module.exports = function(req, res, next) {

  req.db.matches.find().sort({created_at:-1}).limit(6).toArray().then(function(docs){
    var recents = [];
    docs.forEach(function(doc) {
      recents.push(doc.services[doc._id.split("$$")[0]]);
    });

    Router.run(routes, req.url, function (Handler) {
      var App = React.createFactory(Handler);
      var content = React.renderToString(App({recents: recents}));
      res.send('<!doctype html>\n' + content.replace("</body></html>", "<script>var recents = " + JSON.stringify(recents) + "</script></body></html>"));
    });
  }).catch(function(err) {
    console.log(err)
  });
}