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

var search = require('./routes/search');
var share = require('./routes/share');
var itunesProxy = require('./routes/itunes-proxy');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
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

// force SSL
app.get('*', function(req,res,next) {
  if (req.headers['cf-visitor'] && req.headers['cf-visitor'] != '{"scheme":"https"}') {
    res.redirect("https://" + req.headers['host'] + req.url);
  } else {
    next();
  }
});

app.get('/', function(req, res) {
  var samples = [
    {artist: "Aesop Rock", album: "Skelethon", url: '/google/album/B3ppmqcekrmxln4bre33om3qife'},
    {artist: "Hozier", album: "self-titled album", url: '/google/album/Bd3mxcy3otokg4yc45qktq7l35q'},
    {artist: "Daft Punk", album: "Discovery", url: '/google/album/B4t6yqqvhnb2hy4st4uisjrcsrm'}
  ];
  res.render('index', { page: "home", samples: samples, error: req.flash('search-error') });
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
        message: err.message,
        error: {}
    });
});


module.exports = app;
