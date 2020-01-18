import debuglog from 'debug';

import services from '../lib/services.js';
import render from '../lib/render.js';
import models from '../models/index.cjs';

const debug = debuglog('combine.fm:share');

const recentQuery = {
  include: [
    { model: models.artist },
    { model: models.match },
  ],
  limit: 9,
  order: [
    ['updatedAt', 'DESC'],
  ],
};

export default async function (ctx) {
  const recentAlbums = await models.album.findAll(recentQuery);
  const recentTracks = await models.track.findAll(recentQuery);

  const serviceList = services.map(service => service.id);
  const recents = recentAlbums.map(album => album.toJSON())
      .concat(recentTracks.map(track => track.toJSON()))
      .sort((a, b) => a.createdAt < b.createdAt).slice(0, 9);

  const url = '/';

  const html = await render(url, { manifest: ctx.manifest, services: serviceList, recents });

  const head = {
    title: 'Share Music',
    shareUrl: `${this.request.origin}${url}`,
    image: `${this.request.origin}/assets/images/logo-512.png`,
    share: false,
  };

  await ctx.render('index', {
    initialState: { services: serviceList, recents },
    head,
    html,
  });
}
