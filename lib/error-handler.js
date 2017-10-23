import debuglog from 'debug';

const debug = debuglog('combine.fm');

export default function (raven) {
  return function* error(next) {
    this.set('Server', 'Nintendo 64');
    try {
      yield next;
    } catch (err) {
      if (err.status === 404) {
        this.body = '404 Page Not Found';
      } else if (err.status >= 400 && err.status < 500) {
        this.status = err.status;
        this.body = err.error;
      } else {
        debug('Error: %o', err);
        raven.captureException(err);
        throw err;
      }
    }

    if (this.status !== 404) return;

    switch (this.accepts('html', 'json')) {
      case 'html':
        this.type = 'html';
        this.body = '404 Page Not Found';
        break;
      case 'json':
        this.body = {
          message: 'Page Not Found',
        };
        break;
      default:
        this.type = 'text';
        this.body = 'Page Not Found';
    }
  };
}
