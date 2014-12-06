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

var db;
if (process.env.MONGOHQ_URL) {
  console.log("Connecting to MongoHQ")
  db = pmongo(process.env.MONGOHQ_URL, ['matches']);
} else {
  db = pmongo('match-audio', ['matches']);
}

app.use(function(req, res, next) {
  req.db = res.db = db;
  next();
})

// force SSL
app.get('*', function(req,res,next) {
  if (req.headers['cf-visitor'] && req.headers['cf-visitor'] != '{"scheme":"https"}') {
    res.redirect("https://" + req.headers['host'] + req.url);
  } else if (req.headers['cf-visitor']) {
    req.userProtocol = "https";
  } else {
    req.userProtocol = "http"
  }
  next();
});

app.get('/', function(req, res) {
  var samples = [
    {artist: "Aesop Rock", album: "Skelethon", url: '/google/album/B3ppmqcekrmxln4bre33om3qife'},
    {artist: "Hozier", album: "self-titled album", url: '/google/album/Bd3mxcy3otokg4yc45qktq7l35q'},
    {artist: "Daft Punk", album: "Discovery", url: '/google/album/B4t6yqqvhnb2hy4st4uisjrcsrm'}
  ];

  // shitty sort until I add more metadata on cached items
  req.db.matches.find().sort({$natural:-1}).limit(6).toArray().then(function(docs){
    res.render('index', { page: "home", samples: samples, recent: docs, error: req.flash('search-error') });
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
