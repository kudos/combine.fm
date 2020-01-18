import kue from 'kue';
import debuglog from 'debug';

import services from '../lib/services.js';
import render from '../lib/render.js';
import models from '../models/index.cjs';
import { find, create } from '../lib/share.js';

const debug = debuglog('combine.fm:share');

const queue = kue.createQueue({
  redis: process.env.REDIS_URL,
});

export default async function (ctx, serviceId, type, itemId, format) {
  ctx.assert(type === 'album' || type === 'track', 400, { error: 'Invalid type' });

  let share = await models[type].findOne({
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
    const music = await matchedService.lookupId(itemId, type);

    ctx.assert(music, 400, { error: { message: 'No supported music found at that link :(' } });

    share = await find(music);

    if (!share) {
      share = await create(music);

      services.forEach((service) => {
        if (service.id !== share.service) {
          const job = queue.create('search', { title: `Matching ${share.name} on ${service.id}`, share, service })
            .attempts(3)
            .backoff({ type: 'exponential' })
            .save((err) => {
              debug(err || `JobID: ${job.id}`);
            });
        }
      });
    }
  }

  ctx.assert(share, 404);

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
    ctx.body = share;
  } else {
    const initialState = {
      item: share,
      services: services.map(service => service.id),
      share: true,
    };

    const url = `/${serviceId}/${type}/${itemId}`;

    const html = await render(url, initialState);

    const head = {
      share,
      title: `${share.name} by ${share.artist.name}`,
      shareUrl: `${ctx.request.origin}${url}`,
      image: share.matches.find(el => el.service === share.service).artworkLarge,
    };

    await ctx.render('index', {
      initialState,
      share,
      head,
      html,
    });
  }
}
