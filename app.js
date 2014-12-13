"use strict";
var express = require('express');
var helmet = require('helmet');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var pmongo = require('promised-mongo');

var search = require('./routes/search');
var share = require('./routes/share');
var itunesProxy = require('./routes/itunes-proxy');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard catz',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

var dbUrl = process.env.MONGOHQ_URL || "mongodb://localhost/match-audio";
app.use(function(req, res, next) {
  req.db = res.db = pmongo(dbUrl, ['matches']);
  next();
});


app.get('*', function(req,res,next) {
  // force SSL
  if (req.headers['cf-visitor'] && req.headers['cf-visitor'] != '{"scheme":"https"}') {
    return res.redirect("https://" + req.headers['host'] + req.url);
  } else if (req.headers['cf-visitor']) {
    req.userProtocol = "https";
  } else {
    req.userProtocol = "http";
  }
  // redirect www
  if (req.headers.host.match(/^www/) !== null ) {
    return res.redirect(req.userProtocol + '://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    next();
  }
});

app.get('/', function(req, res) {
  req.db.matches.find().sort({created_at:-1}).limit(6).toArray().then(function(docs){
    res.render('index', { page: "home", recent: docs, error: req.flash('search-error') });
  });
});

app.post('/search', search);
app.get('/:service/:type/:id', share);
app.get('/itunes/*', itunesProxy);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      page: "error",
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    page: "error",
    message: err.message,
    error: {status: err.status || 500}
  });
});


module.exports = app;
