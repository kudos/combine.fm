import React from 'react';
import createHandler from './react-handler';

import debuglog from 'debug';
const debug = debuglog('match.audio');

export default function (routes) {
  return function* (next) {
    this.set('Server', 'Nintendo 64');
    try {
      yield next;
    } catch (err) {
      if (err.status === 404) {
        let Handler = yield createHandler(routes, this.request.url);

        let App = React.createFactory(Handler);
        let content = React.renderToString(new App());

        this.body = '<!doctype html>\n' + content;
      } else {
        debug('Error: %o', err);
        throw err;
      }
    }

    if (404 != this.status) return;

    switch (this.accepts('html', 'json')) {
      case 'html':
        this.type = 'html';
        let Handler = yield createHandler(routes, this.request.url);

        let App = React.createFactory(Handler);
        let content = React.renderToString(new App());

        this.body = '<!doctype html>\n' + content;
        break;
      case 'json':
        this.body = {
          message: 'Page Not Found'
        };
        break;
      default:
        this.type = 'text';
        this.body = 'Page Not Found';
    }
  }
}
