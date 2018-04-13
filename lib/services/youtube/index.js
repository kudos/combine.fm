import { parse } from 'url';
import querystring from 'querystring';
import request from 'superagent';
import Nodebrainz from 'nodebrainz';
import { toSeconds, parse as ptParse } from 'iso8601-duration';
import debuglog from 'debug';
import urlMatch from './url';

const debug = debuglog('combine.fm:youtube');

if (!process.env.YOUTUBE_KEY) {
  debug('YOUTUBE_KEY environment variable not found, deactivating Youtube.');
}

const credentials = {
  key: process.env.YOUTUBE_KEY,
};

const apiRoot = 'https://www.googleapis.com/youtube/v3';

// const nodebrainz = new Nodebrainz({
//   userAgent: 'combine.fm ( https://combine.fm )',
//   defaultLimit: 10,
//   retryOn: true,
//   retryDelay: 3000,
//   retryCount: 10,
// });

export function* lookupId(id) {
  const path = `/videos?part=snippet%2CcontentDetails&id=${id}&key=${credentials.key}`;
  try {
    const result = yield request.get(apiRoot + path);
    const item = result.body.items[0].snippet;

    const duration = toSeconds(ptParse(result.body.items[0].contentDetails.duration));

    const split = item.title.match(/([^-]+)-(.*)/);

    const artist = split[1].trim();
    const name = split[2].match(/^[^([]+/)[0].trim();

    // nodebrainz.luceneSearch('recording', {artist, query: release }, (err, response) => {
    //   const recording = response.recordings[0];
    //   debug(recording.releases[0].media[0].track[0].title)
    //   artist = recording['artist-credit'].name;
    //   release = recording.media;
    // });

    const match = {
      id,
      type: 'album',
      service: 'youtube',
      name,
      artist: { name: artist },
      streamUrl: `https://youtu.be/${id}`,
      purchaseUrl: null,
      artwork: {
        small: item.thumbnails.medium.url,
        large: item.thumbnails.high.url,
      },
    };

    // Hacky check whether this is long enough to be an album
    if (duration < 1200) {
      match.type = 'track';
      match.album = { name: '' };
    }

    return match;
  } catch (err) {
    debug(err);
    return { service: 'youtube' };
  }
}

export function* search(data) {
  let query;
  const type = data.type;

  if (type === 'album') {
    query = `${data.artist.name} ${data.name}`;
  } else if (type === 'track') {
    query = `${data.artist.name} ${data.name}`;
  }

  const path = `/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCaption=any&videoCategoryId=10&key=${credentials.key}`;
  const result = yield request.get(apiRoot + path);
  const item = result.body.items[0];

  if (!item) {
    return { service: 'youtube', type: 'video' };
  }
  return {
    service: 'youtube',
    type: 'video',
    id: item.id.videoId,
    name: item.snippet.title,
    streamUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    purchaseUrl: null,
    artwork: {
      small: item.snippet.thumbnails.medium.url,
      large: item.snippet.thumbnails.high.url,
    },
  };
}

export function parseUrl(url) {
  const parsed = parse(url);
  const query = querystring.parse(parsed.query);
  let id = query.v;

  if (!id) {
    id = parsed.path.substr(1);
    if (!id) {
      throw new Error();
    }
  }
  return lookupId(id, 'track');
}

export const id = 'youtube';
export const match = urlMatch;
