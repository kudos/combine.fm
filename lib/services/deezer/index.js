import { parse } from 'url';
import request from 'superagent';
import 'superagent-bluebird-promise';
import debuglog from 'debug';
import urlMatch from './url';

const debug = debuglog('combine.fm:deezer');

const apiRoot = 'https://api.deezer.com';

export function parseUrl(url) {
  const matches = parse(url).path.match(/\/(album|track)[/]+([^/]+)/);

  if (matches && matches[2]) {
    return module.exports.lookupId(matches[2], matches[1]);
  }
  throw new Error();
}

function exactMatch(needle, haystack, type, various) {
  // try to find exact match
  return haystack.find((entry) => {
    if (!entry[type] || (various && (entry.artist.name !== 'Various' || entry.artist.name !== 'Various Artists'))) {
      return false;
    }
    const title = entry[type].title;
    if (title) {
      return entry;
    }
    return false;
  });
}

function looseMatch(needle, haystack, type, various) {
  // try to find exact match
  return haystack.find((entry) => {
    if (!entry[type] || (various && (entry.artist.name !== 'Various' || entry.artist.name !== 'Various Artists'))) {
      return false;
    }
    const name = entry[type].title || entry[type].name;
    if (name.indexOf(needle) >= 0) {
      return entry[type];
    }
    return false;
  });
}


export function* lookupId(id, type) {
  const path = `/${type}/${id}?size=xl`;

  const { body } = yield request.get(apiRoot + path).promise();
  if (!body || body.error) {
    const error = new Error('Not Found');
    error.status = 404;
    return Promise.reject(error);
  }
  const item = body;

  const artwork = {
    small: item.cover_medium || item.artist.picture_medium,
    large: item.cover_xl || item.artist.picture_xl,
  };

  if (type === 'album') {
    return Promise.resolve({
      service: 'deezer',
      type,
      id: item.id,
      name: item.title,
      streamUrl: item.link,
      purchaseUrl: null,
      artwork,
      artist: {
        name: item.artist.name,
      },
    });
  } else if (type === 'track') {
    return Promise.resolve({
      service: 'deezer',
      type,
      id: item.id,
      name: item.title,
      streamUrl: item.album.link,
      purchaseUrl: null,
      artwork,
      artist: {
        name: item.artist.name,
      },
      album: {
        name: item.album.title,
      },
    });
  }
  return Promise.reject(new Error());
}

export function* search(data, original = {}) {
  function cleanParam(str) {
    return str.replace(/[:?&]+/, '');
  }
  let query;
  let album;
  const { type } = data;

  const various = data.artist.name === 'Various Artists' || data.artist.name === 'Various';

  if (type === 'album') {
    // Deezer is shitty about artists with these names, strip them instead
    if (various) {
      query = cleanParam(data.name);
    } else {
      query = `${cleanParam(data.artist.name)} ${cleanParam(data.name)}`;
    }
    album = data.name;
  } else if (type === 'track') {
    query = `${cleanParam(data.artist.name)} ${cleanParam(data.albumName)} ${cleanParam(data.name)}`;
    album = data.albumName;
  }

  const path = `/search/${type}?q=${encodeURIComponent(query)}`;

  const response = yield request.get(apiRoot + path);

  const name = original.name || data.name;

  if (response.body.data.length > 0) {
    let match = exactMatch(name, response.body.data, data.type, various);
    if (!match) {
      match = looseMatch(name, response.body.data, data.type, various);
    }

    return yield module.exports.lookupId(response.body.data[0].id, type);
  }
  const matches = album.match(/^[^([]+/);
  if (matches && matches[0] && matches[0] !== album) {
    const cleanedData = JSON.parse(JSON.stringify(data));
    if (type === 'album') {
      cleanedData.name = matches[0].trim();
    } else if (type === 'track') {
      cleanedData.albumName = matches[0].trim();
    }
    return yield module.exports.search(cleanedData, data);
  }
  return Promise.resolve({ service: 'deezer' });
}

export const id = 'deezer';
export const match = urlMatch;
