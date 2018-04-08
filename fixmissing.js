import co from 'co';
import kue from 'kue';
import debuglog from 'debug';

import models from './models';
import services from './lib/services';

const debug = debuglog('combine.fm:fixmissing');

const queue = kue.createQueue({
  redis: process.env.REDIS_URL,
});

debug('Fixing missing');

const serviceIds = [];

for (const service of services) {
  serviceIds.push(service.id);
}

const query = {
  include: [
    { model: models.artist },
    { model: models.match },
  ],
  order: [
    ['createdAt', 'DESC'],
  ],
};

function search(data) {
  const share = data.share;
  const service = services.find(item => data.service.id === item.id);

  debug(`Matching ${share.name} on ${data.service.id}`);

  const job = queue.create('search-backlog', { title: `Matching ${share.name} on ${service.id}`, share, service })
    .attempts(3)
    .backoff({ type: 'exponential' })
    .save((err) => {
      debug(err || `JobID: ${job.id}`);
    });
}

function* find(model) {
  const items = yield models[model].findAll(query);
  for (const item of items) {
    let unmatched = serviceIds;
    for (const match of item.matches) {
      unmatched = unmatched.filter(id => match.service !== id);
    }
    if (unmatched.length > 0) {
      debug(`Matching ${unmatched.join(', ')}`);
      for (const toMatch of unmatched) {
        search({ share: item, service: { id: toMatch } });
      }
    } else {
      debug(`No broken matches for ${item.name}`);
    }
  }
  return Promise.resolve();
}

co(function* main() {
  yield find('album');
  yield find('track');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}).catch((err) => {
  debug(err.stack);
});
