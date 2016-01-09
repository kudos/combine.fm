import path from 'path';
import zlib from 'zlib';
import koa from 'koa';
import cors from 'kcors';
import route from 'koa-route';
import logger from 'koa-logger';
import favicon from 'koa-favicon';
import compress from 'koa-compress';
import staticHandler from 'koa-file-server';
import bodyparser from 'koa-bodyparser';
import co from 'co';
import db from './config/db';
import index from './routes/index';
import search from './routes/search';
import share from './routes/share';
import itunesProxy from './routes/itunes-proxy';

import React from 'react';
import { routes } from './views/app';
import errorHandler from './lib/error-handler';

import debuglog from 'debug';
const debug = debuglog('match.audio');

const app = koa();

app.use(errorHandler(routes));

app.use(bodyparser());
app.use(cors());
app.use(compress({flush: zlib.Z_SYNC_FLUSH }));
app.use(favicon(path.join(__dirname, '/public/images/favicon.png')));
app.use(logger());
app.use(staticHandler({root: 'public', maxage: 31536000000}));

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

if (!module.parent) {
  app.listen(process.env.PORT || 3000, function() {
    debug('Koa HTTP server listening on port ' + (process.env.PORT || 3000));
  });
}

export default app;
