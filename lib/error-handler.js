import React from 'react';
import { renderPage } from './react-handler';

import debuglog from 'debug';
const debug = debuglog('match.audio');

export default function (routes) {
  return function* (next) {
    this.set('Server', 'Nintendo 64');
    try {
      yield next;
    } catch (err) {
      if (err.status === 404) {
        this.body = yield renderPage(routes, this.request.url, {});
      } else {
        debug('Error: %o', err);
        throw err;
      }
    }

    if (404 != this.status) return;

    switch (this.accepts('html', 'json')) {
      case 'html':
        this.type = 'html';
        this.body = yield renderPage(routes, this.request.url, {});
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
