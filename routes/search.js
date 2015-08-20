import { parse } from 'url';
import co from 'co';
import lookup from '../lib/lookup';
import services from '../lib/services';

module.exports = function* () {
  const url = parse(this.request.body.url);
  this.assert(url.host, 400, {error: {message: 'You need to submit a url.'}});

  const item = yield lookup(this.request.body.url);

  this.assert(item, 400, {error: {message: 'No supported music found at that link :('}});

  item.matched_at = new Date(); // eslint-disable-line camelcase
  const matches = {};
  matches[item.service] = item;


  for (let service of services) {
    if (service.id === item.service) {
      continue;
    }
    matches[service.id] = {service: service.id};
  }

  yield this.db.matches.save({_id: item.service + '$$' + item.id, 'created_at': new Date(), services: matches});
  this.body = item;

  process.nextTick(co.wrap(function* (){
    for (let service of services) {
      if (service.id === item.service) {
        continue;
      }
      matches[service.id] = {service: service.id};
      const match = yield service.search(item);
      match.matched_at = new Date(); // eslint-disable-line camelcase
      const update = {};
      update['services.' + match.service] = match;
      yield this.db.matches.updateOne({_id: item.service + '$$' + item.id}, {'$set': update});
    }
  }.bind(this)));
};
