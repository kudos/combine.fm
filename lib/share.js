import co from 'co';
import debuglog from 'debug';

import models from '../models';
import services from '../lib/services';

const debug = debuglog('match.audio:share');

export function find(music) {
  return models[music.type].findOne({
    where: {
      externalId: music.id,
    },
    include: [
      { model: models.artist },
      { model: models.match },
    ],
  });
}

export function create(music) {
  return models[music.type].create({
    externalId: music.id,
    service: music.service,
    name: music.name,
    albumName: music.type === 'track' ? music.album.name : null,
    artist: {
      name: music.artist.name,
      artworkSmall: null,
      artworkLarge: null,
    },
    matches: [
      {
        externalId: music.id,
        service: music.service,
        name: music.name,
        streamUrl: music.streamUrl,
        purchaseUrl: music.purchaseUrl,
        artworkSmall: music.artwork.small,
        artworkLarge: music.artwork.large,
      },
    ],
  }, {
    include: [
      { model: models.artist },
      { model: models.match },
    ],
  });
}

export function findMatchesAsync(share) {
  process.nextTick(() => {
    for (const service of services) {
      if (service.id === share.service) {
        continue; // eslint-disable-line no-continue
      }
      co(function* gen() { // eslint-disable-line no-loop-func
        const match = yield service.search(share);
        console.log(service.id)
        console.log(match)
        if (match.id) {
          models.match.create({
            trackId: share.$modelOptions.name.singular == 'track' ? share.id : null,
            albumId: share.$modelOptions.name.singular == 'album' ? share.id : null,
            externalId: match.id,
            service: match.service,
            name: match.name,
            streamUrl: match.streamUrl,
            purchaseUrl: match.purchaseUrl,
            artworkSmall: match.artwork.small,
            artworkLarge: match.artwork.large,
          });
        } else {
          models.match.create({
            trackId: share.$modelOptions.name.singular == 'track' ? share.id : null,
            albumId: share.$modelOptions.name.singular == 'album' ? share.id : null,
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
        debug(err);
      });
    }
  });
}
