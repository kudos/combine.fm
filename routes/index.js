import debuglog from 'debug';

import services from '../lib/services';
import render from '../lib/render';
import models from '../models';

const debug = debuglog('match.audio:share');

const recentQuery = {
  include: [
    { model: models.artist },
    { model: models.match },
  ],
  limit: 6,
  order: [
    ['updatedAt', 'DESC'],
  ],
};

export default function* () {
  const recentAlbums = yield models.album.findAll(recentQuery);
  const recentTracks = yield models.track.findAll(recentQuery);

  const initialState = {
    recents: recentAlbums.map(album => album.toJSON())
      .concat(recentTracks.map(track => track.toJSON()))
      .sort((a, b) => a.createdAt < b.createdAt).slice(0, 6),
    services: services.map(service => service.id),
  };

  const url = '/';

  const html = yield render(url, initialState);

  const head = {
    title: `Share Music`,
    shareUrl: `${this.request.origin}${url}`,
    image: `${this.request.origin}/assets/images/logo-512.png`,
  }

  yield this.render('index', {
    initialState,
    head,
    html,
  });
}
