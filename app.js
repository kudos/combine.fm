import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import koa from 'koa';
import cors from 'kcors';
import route from 'koa-route';
import logger from 'koa-logger';
import favicon from 'koa-favicon';
import compress from 'koa-compress';
import serve from 'koa-static';
import views from 'koa-views';
import bodyparser from 'koa-bodyparser';
import Sentry from '@sentry/node';
import debuglog from 'debug';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import index from './routes/index.js';
import recent from './routes/recent.js';
import search from './routes/search.js';
import share from './routes/share.js';
import { slack, oauth } from './routes/slack.js';
import errorHandler from './lib/error-handler.js';
import newrelic from 'newrelic';
import { constants }  from 'zlib'

const debug = debuglog('combine.fm');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.VUE_ENV = 'server';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const app = new koa();

if (process.env.NODE_ENV === 'production') {
  app.proxy = true;
}

app.on('error', (err, ctx) => {
  if (!err.status || err.status >= 500) {
    Sentry.withScope(function(scope) {
      scope.addEventProcessor(function(event) {
        return Sentry.Handlers.parseRequest(event, ctx.request); 
      });
      Sentry.captureException(err);
      debug(err);
    });
  }
});

app.use(errorHandler(Sentry));

app.use(bodyparser());
app.use(cors());
app.use(compress({ 
  filter (content_type) {
  	return /text/i.test(content_type)
  },
  threshold: 2048,
  gzip: {
    flush: constants.Z_SYNC_FLUSH
  },
  deflate: {
    flush: constants.Z_SYNC_FLUSH,
  },
  br: false
 }));
app.use(favicon(path.join(__dirname, '/public/assets/images/favicon.png')));
app.use(logger());
app.use(serve('public', { maxage: 31536000000 }));

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '/public/dist/manifest.json')));

app.use(async function(ctx, next) {
  Sentry.configureScope(scope => {
    scope.setExtra('Request', {
      'url': ctx.request.url,
      'method': ctx.request.method,
      'user-agent': ctx.request.header['user-agent'],
    });
  });
  ctx.state.manifest = manifest;
  await next();
});

app.use(views(path.resolve(__dirname, './views'), {
  map: {
    html: 'ejs',
  },
}));

app.use(route.get('/', index));
app.use(route.get('/recent', recent));
app.use(route.post('/search', search));
app.use(route.get('/:service/:type/:id.:format?', share));

app.use(route.post('/slack', slack));
app.use(route.get('/slack', slack));
app.use(route.get('/oauth', oauth));

if (process.argv[1] === __filename) {
  app.listen(process.env.PORT || 3000, () => {
    debug(`Koa HTTP server listening on port ${(process.env.PORT || 3000)}`);
  });
}

export default app;
