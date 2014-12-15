"use strict";

var React = require('react');
var nodejsx = require('node-jsx').install({extension: '.jsx'});
var Home = React.createFactory(require('../client/index.jsx').Home);

module.exports = function(req, res, next) {

  req.db.matches.find().sort({created_at:-1}).limit(6).toArray().then(function(docs){
    var recent = [];
    docs.forEach(function(doc) {
      recent.push(doc.services[doc._id.split("$$")[0]]);
    })

    var home = Home({recent: recent});
    res.send('<!doctype html>\n' + React.renderToString(home).replace("</body></html>", "<script>var recent = " + JSON.stringify(recent) + "</script></body></html>"));
    //res.render('index', { page: "home", recent: docs, error: req.flash('search-error') });
  });
}