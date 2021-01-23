import { parse } from 'url';
import bluebird from 'bluebird';
import PlayMusic from 'playmusic';
import debuglog from 'debug';
import urlMatch from './url.js';

const debug = debuglog('combine.fm:google');

const pm = bluebird.promisifyAll(new PlayMusic());

if (!(process.env.GOOGLE_EMAIL && process.env.GOOGLE_PASSWORD) && !(process.env.GOOGLE_ANDROID_ID && process.env.GOOGLE_MASTER_TOKEN)) {
  debug('Required GOOGLE_* environment variables not found, deactivating Google Play Music.');
}

const creds = {
  androidId: process.env.GOOGLE_ANDROID_ID,
  masterToken: process.env.GOOGLE_MASTER_TOKEN,
};

let ready = pm.initAsync(creds).catch(function(err) {
  debug(err);
});

export async function lookupId(id, type) {
  await ready;
  try {
    if (type === 'album') {
      const album = await pm.getAlbumAsync(id, false);
      return {
        service: 'google',
        type: 'album',
        id: album.albumId,
        name: album.name,
        streamUrl: `https://play.google.com/music/m/${album.albumId}?signup_if_needed=1`,
        purchaseUrl: `https://play.google.com/store/music/album?id=${album.albumId}`,
        artwork: {
          small: album.albumArtRef.replace('http:', 'https:'),
          large: album.albumArtRef.replace('http:', 'https:'),
        },
        artist: {
          name: album.artist,
        },
      };
    } else if (type === 'track') {
      const track = await pm.getAllAccessTrackAsync(id);
      return {
        service: 'google',
        type: 'track',
        id: track.nid,
        name: track.title,
        streamUrl: `https://play.google.com/music/m/${track.nid}?signup_if_needed=1`,
        purchaseUrl: `https://play.google.com/store/music/album?id=${track.albumId}`,
        artwork: {
          small: track.albumArtRef[0].url.replace('http:', 'https:'),
          large: track.albumArtRef[0].url.replace('http:', 'https:'),
        },
        album: {
          name: track.album,
        },
        artist: {
          name: track.artist,
        },
      };
    }
  } catch(e) {
    const error = new Error('Not Found');
    error.status = 404;
    return Promise.reject(error);
  }
  const error = new Error('Not Found');
  error.status = 404;
  return Promise.reject(error);
}

function exactMatch(needle, haystack, type) {
  // try to find exact match
  return haystack.find((entry) => {
    if (!entry[type]) {
      return false;
    }
    const title = entry[type].title;
    if (title === needle) {
      return entry;
    }
    return false;
  });
}

function looseMatch(needle, haystack, type) {
  // try to find exact match
  return haystack.find((entry) => {
    if (!entry[type]) {
      return false;
    }
    const name = entry[type].title || entry[type].name;
    if (name.indexOf(needle) >= 0) {
      return entry[type];
    }
    return false;
  });
}

export async function search(data, original = {}, cleaned = false) {
  // Disable google since it doesn't respond anymore
  return { service: 'google' };
}

export async function parseUrl(url) {
  await ready;
  const parsed = parse(url.replace(/\+/g, '%20'));
  const path = parsed.path;
  const hash = parsed.hash;
  if (hash) {
    const parts = hash.split('/');
    const type = parts[1];
    const id = parts[2];
    const artist = decodeURIComponent(parts[3]);
    const album = decodeURIComponent(parts[4]);

    if (type !== 'album' && type !== 'track') {
      return false;
    }

    if (id.length > 0) {
      return { id, type };
    }
    return await search({ type, name: album, artist: { name: artist } });
  } else if (path) {
    const matches = path.match(/\/music\/m\/([\w]+)/);
    const type = matches[1][0] === 'T' ? 'track' : 'album';
    return await lookupId(matches[1], type);
  }
  return false;
}

export const match = urlMatch;
export const id = 'google';
