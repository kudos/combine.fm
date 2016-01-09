import React from 'react';
import { renderPage } from '../lib/react-handler';
import { routes } from '../views/app';
import services from '../lib/services';
import co from 'co';

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

  let doc = yield this.db.matches.findOne({_id: serviceId + '$$' + itemId});
  if (!doc) {
    const item = yield matchedService.lookupId(itemId, type);
    this.assert(item.id, 404);
    item.matched_at = new Date(); // eslint-disable-line camelcase
    const matches = {};
    matches[item.service] = item;

    for (let service of services) {
      if (service.id === item.service) {
        continue;
      }
      matches[service.id] = {service: service.id};
    }
    doc = {_id: item.service + '$$' + item.id, 'created_at': new Date(), services: matches};
    yield this.db.matches.save(doc);
    process.nextTick(() => {
      for (let service of services) {
        console.log(service.id);
        if (service.id === item.service) {
          continue;
        }
        matches[service.id] = {service: service.id};
        co(function* (){
          const match = yield service.search(item);
          console.log(match.id);
          match.matched_at = new Date(); // eslint-disable-line camelcase
          const update = {};
          update['services.' + match.service] = match;
          yield this.db.matches.updateOne({_id: item.service + '$$' + item.id}, {'$set': update});
        }.bind(this)).catch((err) => {
          debug(err);
        });
      }
    });
  }

  const shares = formatAndSort(doc.services, serviceId);

  if (format === 'json') {
    return this.body = {shares: shares};
  }

  this.body = yield renderPage(routes, this.request.url, {shares: shares});
};
