import co from 'co';
import debuglog from 'debug';

import models from '../models';
import services from '../lib/services';

const debug = debuglog('combine.fm:share');

export function find(music) {
  return models[music.type].findOne({
    where: {
      externalId: music.id.toString(),
    },
    include: [
      { model: models.artist },
      { model: models.match },
    ],
  });
}

export function create(music) {
  return models[music.type].create({
    externalId: music.id.toString(),
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
        externalId: music.id.toString(),
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
