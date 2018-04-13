import { parse } from 'url';
import bluebird from 'bluebird';
import PlayMusic from 'playmusic';
import debuglog from 'debug';
import urlMatch from './url';

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
  return { service: 'google' };
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
  await ready;
  let query;
  let album;
  const type = data.type;

  if (type === 'album') {
    query = `${data.artist.name} ${data.name}`;
    album = data.name;
  } else if (type === 'track') {
    query = `${data.artist.name} ${data.albumName} ${data.name}`;
    album = data.albumName;
  }

  const result = await pm.searchAsync(query, 5);

  if (!result.entries) {
    if (cleaned) {
      return { service: 'google' };
    }
    const matches = album.match(/^[^([]+/);
    if (matches && matches[0]) {
      const cleanedData = JSON.parse(JSON.stringify(data));
      if (type === 'album') {
        cleanedData.name = data.name.match(/^[^([]+/)[0].trim();
      } else if (type === 'track') {
        cleanedData.albumName = data.albumName.match(/^[^([]+/)[0].trim();
        cleanedData.name = data.name.match(/^[^([]+/)[0].trim();
      }
      return await search(cleanedData, data, true);
    }
    return { service: 'google' };
  }

  const name = original.name || data.name;

  let match = exactMatch(name, result.entries, data.type);
  if (!match) {
    match = looseMatch(name, result.entries, data.type);
  }

  if (!match) {
    return { service: 'google' };
  }
  if (type === 'album') {
    return await lookupId(match.album.albumId, type);
  } else if (type === 'track') {
    return await lookupId(match.track.storeId, type);
  }
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
