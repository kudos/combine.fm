"use strict";
var express = require("express");
var helmet = require("helmet");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("connect-flash");
var compress = require("compression");
var bodyParser = require("body-parser");
var pmongo = require("promised-mongo");

var index = require("./routes/index");
var search = require("./routes/search");
var share = require("./routes/share");
var itunesProxy = require("./routes/itunes-proxy");

var React = require("react");
require("node-jsx").install({extension: ".jsx"});

var ErrorView = React.createFactory(require("./views/error.jsx"));

var browserify = require("connect-browserify");

var app = express();

var development = process.env.NODE_ENV !== "production";

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(compress());
app.use(favicon(path.join(__dirname, "/public/images/favicon.png")));
app.use(helmet());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: "keyboard catz",
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

var dbUrl = process.env.MONGOHQ_URL || "mongodb://localhost/match-audio";
app.use(function(req, res, next) {
  req.db = res.db = pmongo(dbUrl, ["matches"]);
  next();
});

if (development) {
  app.get("/javascript/bundle.js",
    browserify("./views/app.jsx", {
      debug: true,
      watch: true
    }));
}

app.get("*", function(req, res, next) {
  // force SSL
  if (req.headers["cf-visitor"] && req.headers["cf-visitor"] !== "{\"scheme\":\"https\"}") {
    return res.redirect("https://" + req.headers.host + req.url);
  } else if (req.headers["cf-visitor"]) {
    req.userProtocol = "https";
  } else {
    req.userProtocol = "http";
  }
  // redirect www
  if (req.headers.host.match(/^www/) !== null ) {
    return res.redirect(req.userProtocol + "://" + req.headers.host.replace(/^www\./, "") + req.url);
  } else {
    next();
  }
});

app.get("/", index);
app.post("/search", search);
app.get("/:service/:type/:id.:format?", share);
app.get("/itunes/*", itunesProxy);
app.get("/recent", function(req, res, next) {
  req.db.matches.find().sort({"created_at": -1}).limit(6).toArray().then(function(docs){
    var recents = [];
    docs.forEach(function(doc) {
      recents.push(doc.services[doc._id.split("$$")[0]]); // eslint-disable-line no-underscore-dangle
    });
    res.json({recents: recents});
  }).catch(function (error) {
    return next(error);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res) {
    console.log(err.stack);
    res.status(err.status || 500);

    var content = React.renderToString(new ErrorView({status: err.status || 500, message: err.message, error: err}));
    res.send("<!doctype html>\n" + content);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);

  var content = React.renderToString(new ErrorView({status: err.status || 500, message: err.message, error: {status: err.status || 500}}));
  res.send("<!doctype html>\n" + content);
});


module.exports = app;
