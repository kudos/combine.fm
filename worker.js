import co from 'co';
import kue from 'kue';
import raven from 'raven';
import debuglog from 'debug';

import models from './models';
import services from './lib/services';

const debug = debuglog('combine.fm:worker');

raven.config(process.env.SENTRY_DSN).install();

const queue = kue.createQueue({
  redis: process.env.REDIS_URL,
});

function search(data, done) {
  const share = data.share;
  const service = services.find(item => data.service.id === item.id);
  debug(`Searching on: ${service.id}`);
  co(function* gen() { // eslint-disable-line no-loop-func
    try {
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
      return done();
    } catch (err) {
      debug(`Error searching on: ${service.id}`);
      debug(share);
      debug(err);
      raven.captureException(err);
      return done(err);
    }
  }).catch((err) => {
    debug(`Error searching on: ${service.id}`);
    debug(share);
    debug(err);
    raven.captureException(err);
    return done();
  });
}

queue.process('search', 5, (job, done) => {
  search(job.data, done);
});


kue.app.listen(3000);
