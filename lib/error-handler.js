import debuglog from 'debug';

const debug = debuglog('combine.fm');

export default function (Sentry) {
  return async function error(ctx, next) {
    ctx.set('Server', 'Nintendo 64');
    try {
      await next();
    } catch (err) {
      if (err.status === 404) {
        ctx.body = '404 Page Not Found';
      } else if (err.status >= 400 && err.status < 500) {
        ctx.status = err.status;
        ctx.body = err.error;
      } else {
        debug('Error: %o', err);
        Sentry.captureException(err);
        throw err;
      }
    }

    if (ctx.status !== 404) return;

    switch (ctx.accepts('html', 'json')) {
      case 'html':
        ctx.type = 'html';
        ctx.body = '404 Page Not Found';
        break;
      case 'json':
        ctx.body = {
          message: 'Page Not Found',
        };
        break;
      default:
        ctx.type = 'text';
        ctx.body = 'Page Not Found';
    }
  };
}
