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

export default function* () {
  const recentAlbums = yield models.album.findAll(recentQuery);
  const recentTracks = yield models.track.findAll(recentQuery);

  this.body = {
    recents: recentAlbums.map(album => album.toJSON())
      .concat(recentTracks.map(track => track.toJSON()))
      .sort((a, b) => a.createdAt < b.createdAt).slice(0, 9),
  };
}
