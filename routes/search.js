import { parse } from 'url';
import kue from 'kue';
import debuglog from 'debug';
import { inspect } from 'util';

import lookup from '../lib/lookup.js';
import services from '../lib/services.js';
import { find, create } from '../lib/share.js';

const debug = debuglog('combine.fm:search');

const queue = kue.createQueue({
  redis: process.env.REDIS_URL,
});

export default async function (ctx) {
  try {
    const url = parse(ctx.request.body.url);

    ctx.assert(url.host, 400, { error: { message: 'You need to submit a url.' } });

    const music = await lookup(ctx.request.body.url);
    debug(music);
    ctx.assert(music, 400, { error: { message: 'No supported music found at that link :(' } });

    let share = await find(music);

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

    share = share.toJSON();

    share.id = share.externalId;

    const unmatched = services.filter(service =>
      !share.matches.find(match => match.service === service.id));

    share.matches = share.matches.concat(unmatched.map((service) => {
      return {
        service: service.id,
        matching: true,
      };
    }));

    share.matches = share.matches.sort(a => !!a.externalId);

    ctx.body = share;
  } catch (err) {
    if (err.name === 'BadRequestError') {
      throw err;
    }
    debug(inspect(err, {showHidden: false, depth: null}));
    ctx.throw(400, { error: { message: 'Unexpected error looking up music. Please try again later.' } });
  }
}
