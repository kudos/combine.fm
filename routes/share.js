import services from '../lib/services';
import render from '../lib/render';
import models from '../models';
import { find, create, findMatchesAsync } from '../lib/share';

export default function* (serviceId, type, itemId, format) {
  this.assert(type === 'album' || type === 'track', 400, { error: 'Invalid type' });

  let share = yield models[type].findOne({
    where: {
      externalId: itemId,
    },
    include: [
      { model: models.match },
      { model: models.artist },
    ],
  });

  if (!share) {
    const matchedService = services.find(service => serviceId === service.id);
    const music = yield matchedService.lookupId(itemId, type);

    this.assert(music, 400, { error: { message: 'No supported music found at that link :(' } });

    share = yield find(music);

    if (!share) {
      share = yield create(music);
      findMatchesAsync(share);
    }
  }

  this.assert(share, 404);

  const unmatched = services.filter(service =>
    !share.matches.find(match => match.service === service.id));

  share = share.toJSON();
  share.matches = share.matches.concat(unmatched.map((service) => {
    return {
      service: service.id,
      matching: true,
    };
  }));
  share.matches = share.matches.sort(a => !a.externalId);

  if (format === 'json') {
    this.body = share;
  } else {
    const initialState = {
      item: share,
      services: services.map(service => service.id),
      share: true,
    };

    const url = `/${serviceId}/${type}/${itemId}`;

    const html = yield render(url, initialState);

    const head = {
      share,
      title: `${share.name} by ${share.artist.name}`,
      shareUrl: `${this.request.origin}${url}`,
      image: share.matches.find(el => el.service === share.service).artworkLarge,
    };

    yield this.render('index', {
      initialState,
      share,
      head,
      html,
    });
  }
}
