import models from '../models';

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

  ctx.body = {
    recents: recentAlbums.map(album => album.toJSON())
      .concat(recentTracks.map(track => track.toJSON()))
      .sort((a, b) => a.createdAt < b.createdAt).slice(0, 9),
  };
}
