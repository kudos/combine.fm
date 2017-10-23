import co from 'co';
import debuglog from 'debug';

import models from './models';
import services from './lib/services';

const debug = debuglog('combine.fm:fixmissing');

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
    ['updatedAt', 'DESC'],
  ],
};

function* search(data, done) {
  const share = data.share;
  const service = services.find(item => data.service.id === item.id);

  debug(`Matching ${share.name} on ${data.service.id}`)

  const match = yield service.search(share);

  debug(`Match found for ${share.name} on ${data.service.id}`);

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
}

co(function* () {
  const albums = yield models.album.findAll(query);
  for (const item of albums) {
    const unmatched = serviceIds;
    for (const match of item.matches) {
      unmatched = unmatched.filter(id => match.service !== id);
    }
    if (unmatched.length > 0) {
      debug(`Matching ${unmatched.join(', ')}`);
      for (const toMatch of unmatched) {
        yield search({ share: item, service: { id: toMatch } });
      }
    } else {
      debug(`No broken matches for ${item.name}`)
    }
  }
}).catch(function (err) {
  debug(err.stack);
});





