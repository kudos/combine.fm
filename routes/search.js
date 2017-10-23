import { parse } from 'url';
import kue from 'kue';

import lookup from '../lib/lookup';
import services from '../lib/services';
import { find, create, findMatchesAsync } from '../lib/share';

const queue = kue.createQueue({
  redis: {
    host: 'redis',
  },
});

export default function* () {
  const url = parse(this.request.body.url);

  this.assert(url.host, 400, { error: { message: 'You need to submit a url.' } });

  const music = yield lookup(this.request.body.url);

  this.assert(music, 400, { error: { message: 'No supported music found at that link :(' } });

  let share = yield find(music);

  if (!share) {
    share = yield create(music);

    const job = queue.create('search', share).save((err) => {
      if (!err) console.log(job.id);
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

  this.body = share;
}
