import co from 'co';
import kue from 'kue';
import raven from 'raven';

import models from './models';
import services from './lib/services';
import { find, create, findMatchesAsync } from './lib/share';

raven.config(process.env.SENTRY_DSN).install();

const queue = kue.createQueue({
  redis: process.env.REDIS_URL,
});

function search(share, done) {
  for (const service of services) {
    if (service.id === share.service) {
      continue; // eslint-disable-line no-continue
    }
    co(function* gen() { // eslint-disable-line no-loop-func
      const match = yield service.search(share);

      if (match.id) {
        models.match.create({
          trackId: share.type === 'track' ? share.id : null,
          albumId: share.type === 'album' ? share.id : null,
          externalId: match.id.toString(),
          service: match.service,
          name: match.name,
          streamUrl: match.streamUrl,
          purchaseUrl: match.purchaseUrl,
          artworkSmall: match.artwork.small,
          artworkLarge: match.artwork.large,
        });
      } else {
        models.match.create({
          trackId: share.type === 'track' ? share.id : null,
          albumId: share.type === 'album' ? share.id : null,
          externalId: null,
          service: match.service,
          name: null,
          streamUrl: null,
          purchaseUrl: null,
          artworkSmall: null,
          artworkLarge: null,
        });
      }
    }).catch((err) => {
      raven.captureException(err);
    });
  }


  return done();
}

queue.process('search', (job, done) => {
  search(job.data, done);
});


kue.app.listen(3000);
