import React from 'react';
import createHandler from '../lib/react-handler';
import { routes } from '../views/app';
import services from '../lib/services';

function formatAndSort(matches, serviceId) {
  matches = Object.keys(matches).map(function (key) {return matches[key]; });
  matches.sort(function(a, b) {
    return a.id && !b.id;
  }).sort(function(a) {
    return a.service !== serviceId;
  });
  return matches;
};

export default function* (serviceId, type, itemId, format, next) {
  let matchedService;
  services.some(function(service) {
    matchedService = serviceId === service.id ? service : null;
    return matchedService;
  });

  if (!matchedService || (type !== 'album' && type !== 'track')) {
    return yield next;
  }

  const doc = yield this.db.matches.findOne({_id: serviceId + '$$' + itemId});

  this.assert(doc, 404, 'Not Found');

  const shares = formatAndSort(doc.services, serviceId);

  if (format === 'json') {
    return this.body = {shares: shares};
  }

  const Handler = yield createHandler(routes, this.request.url);
  const App = React.createFactory(Handler);
  let content = React.renderToString(new App({shares: shares}));
  content = content.replace('</body></html>', '<script>var shares = ' + JSON.stringify(shares) + '</script></body></html>');

  this.body = '<!doctype html>\n' + content;
};
