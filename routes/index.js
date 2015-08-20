import React from 'react';
import createHandler from '../lib/react-handler';
import { routes } from '../views/app';

export default function* () {
  const recents = [];
  const docs = yield this.db.matches.find().sort({'created_at': -1}).limit(6).toArray();
  docs.forEach(function(doc) {
    let shares = Object.keys(doc.services).map(function (key) {return doc.services[key]; });
    shares.some(function(item) {
      if (item.service === doc._id.split('$$')[0]) { // eslint-disable-line no-underscore-dangle
        recents.push(item);
        return false;
      }
    });
  });

  const Handler = yield createHandler(routes, this.request.url);

  const App = React.createFactory(Handler);
  let content = React.renderToString(new App({recents: recents}));

  content = content.replace('</body></html>', '<script>var recents = ' + JSON.stringify(recents) + '</script></body></html>');

  this.body = '<!doctype html>\n' + content;
};
