import path from 'path';
import koa from 'koa';
import route from 'koa-route';
import logger from 'koa-logger';
import favicon from 'koa-favicon';
import compress from 'koa-compress';
import staticHandler from 'koa-static';
import bodyparser from 'koa-bodyparser';
import React from 'react';
import co from 'co';
import db from './config/db';
import index from './routes/index';
import search from './routes/search';
import share from './routes/share';
import itunesProxy from './routes/itunes-proxy';
import {routes} from './views/app.jsx';
import zlib from 'zlib';
import createHandler from './lib/react-handler';

import debuglog from 'debug';
const debug = debuglog('match.audio');

const app = koa();

app.use(function* (next) {
  this.set('Server', 'Nintendo 64');
  try {
    yield next;
  } catch (err) {
    if (!err.status) {
      console.error(err.stack);
    } else if (err.status === 404) {
      let Handler = yield createHandler(routes, this.request.url);

      let App = React.createFactory(Handler);
      let content = React.renderToString(new App());

      this.body = '<!doctype html>\n' + content;
    } else {
      throw err;
    }
  }
});

app.use(bodyparser());
app.use(compress({flush: zlib.Z_SYNC_FLUSH }));
app.use(favicon(path.join(__dirname, '/public/images/favicon.png')));
app.use(logger());
app.use(staticHandler(path.join(__dirname, 'public')));

let mongo = {};

co(function*() {
  mongo = yield db();
});

app.use(function* (next){
  this.db = mongo;
  yield next;
});

app.use(function* (next) {
  // force SSL
  if (this.headers['cf-visitor'] && this.headers['cf-visitor'] !== '{"scheme":"https"}') {
    return this.redirect('https://' + this.headers.host + this.url);
  } else if (this.headers['cf-visitor']) {
    this.userProtocol = 'https';
  } else {
    this.userProtocol = 'http';
  }
  // redirect www
  if (this.headers.host.match(/^www/) !== null ) {
    return this.redirect(this.userProtocol + '://' + this.headers.host.replace(/^www\./, '') + this.url);
  } else {
    yield next;
  }
});

app.use(route.get('/', index));
app.use(route.post('/search', search));
app.use(route.get('/itunes/(.*)', itunesProxy));
app.use(route.get('/:service/:type/:id.:format?', share));
app.use(route.get('/recent', function* () {
  let recents = [];
  let docs = yield this.db.matches.find().sort({'created_at': -1}).limit(6).toArray();
  docs.forEach(function(doc) {
    recents.push(doc.services[doc._id.split('$$')[0]]); // eslint-disable-line no-underscore-dangle
  });
  this.body = {recents: recents};
}));

app.use(route.get('*', function* () {
  this.throw(404);
}));

module.exports = app;

if (!module.parent) {
  app.listen(process.env.PORT || 3000, function() {
    debug('Koa server listening on port ' + (process.env.PORT || 3000));
  });
}
