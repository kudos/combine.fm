import { parse } from 'url';
import bluebird from 'bluebird';
import rdioInit from 'rdio';
import { match as urlMatch }  from './url';

export let id = 'rdio';

if (!process.env.RDIO_CLIENT_ID || !process.env.RDIO_CLIENT_SECRET) {
  console.warn('RDIO_CLIENT_ID or RDIO_CLIENT_SECRET environment constiables not found, deactivating Rdio.');
}

const Rdio = rdioInit({
  rdio: {
    clientId: process.env.RDIO_CLIENT_ID,
    clientSecret: process.env.RDIO_CLIENT_SECRET,
  }
});

const rdio = bluebird.promisifyAll(new Rdio());

export const match = urlMatch;

export function* lookupId(id) {
  yield rdio.getClientTokenAsync();
  const response = yield rdio.requestAsync({method: 'getObjectFromShortCode', short_code: id}, false);
  const result = response.result;
  const parsedShortUrl = parse(result.shortUrl);
  const rid = parsedShortUrl.path.replace('/x/', '').replace('/', '');
  const type = result.album ? 'track' : 'album';

  const item = {
    service: 'rdio',
    type: type,
    id: rid,
    name: result.name,
    streamUrl: result.shortUrl,
    purchaseUrl: null,
    artwork: {
      small: result.icon.replace('square-200', 'square-250').replace('http:', 'https:'),
      large: result.icon.replace('square-200', 'square-600').replace('http:', 'https:')
    },
    artist: {
      name: result.artist
    }
  };
  if (type === 'track') {
    item.album = {
      name: result.album
    };
  }
  return item;
};

export function* parseUrl(url) {
  const parsedUrl = parse(url);

  let query, args;

  if (parsedUrl.host === 'rd.io') {
    query = {
      method: 'getObjectFromShortCode',
      short_code: parsedUrl.path.replace('/x/', '').replace('/', '')
    };
  } else if (parsedUrl.host.match(/rdio\.com$/)) {
    query = {
      method: 'getObjectFromUrl',
      url: parsedUrl.path
    };
  } else {
    const error = new Error('Not Found');
    error.status = 404;
    throw error;
  }

  yield rdio.getClientTokenAsync();
  const response = yield rdio.requestAsync(query, false);
  const result = response.result;
  const parsedShortUrl = parse(result.shortUrl);
  const id = parsedShortUrl.path.replace('/x/', '').replace('/', '');
  const type = result.album ? 'track' : 'album';
  const item = {
    service: 'rdio',
    type: type,
    id: id,
    name: result.name,
    streamUrl: result.shortUrl,
    purchaseUrl: null,
    artwork: {
      small: result.icon.replace('square-200', 'square-250').replace('http:', 'https:'),
      large: result.icon.replace('square-200', 'square-600').replace('http:', 'https:')
    },
    artist: {
      name: result.artist
    }
  };
  if (type === 'track') {
    item.album = {
      name: result.album
    };
  }
  return item;
};

export function* search(data) {
  let query, albumClean;
  const type = data.type;

  if (type === 'album') {
    query = data.artist.name + ' ' + data.name;
    albumClean = data.name.match(/([^\(\[]+)/)[0];
  } else if (type === 'track') {
    query = data.artist.name + ' ' + data.album.name + ' ' + data.name;
    try {
      albumClean = data.album.name.match(/([^\(\[]+)/)[0];
    } catch(e) {
      albumClean = '';
    }
  }

  yield rdio.getClientTokenAsync();
  const response = yield rdio.requestAsync({method: 'search', query: query, types: type}, false);
  const result = response.result.results.filter(function(item) {
    if (type === 'album' && item.name.match(/([^\(\[]+)/)[0] === albumClean) {
      return item;
    } else if (type === 'track' && (item.album.match(/([^\(\[]+)/)[0] === albumClean || !albumClean)) {
      return item;
    }
  }).shift();

  if (!result) {
    const matches = albumClean.match(/^[^\(\[]+/);
    if (matches && matches[0] && matches[0] !== albumClean) {
      const cleanedData = JSON.parse(JSON.stringify(data));
      if (type === 'album') {
        cleanedData.name = matches[0].trim();
      } else if (type === 'track') {
        cleanedData.album.name = matches[0].trim();
      }
      return module.exports.search(cleanedData);
    } else {
      return {service: 'rdio'};
    }
  } else {
    const parsedShortUrl = parse(result.shortUrl);
    const id = parsedShortUrl.path.replace('/x/', '').replace('/', '');
    const item = {
      service: 'rdio',
      type: type,
      id: id,
      name: result.name,
      streamUrl: result.shortUrl,
      purchaseUrl: null,
      artwork: {
        small: result.icon.replace('square-200', 'square-250').replace('http:', 'https:'),
        large: result.icon.replace('square-200', 'square-600').replace('http:', 'https:')
      },
      artist: {
        name: result.artist
      }
    };
    if (type === 'track') {
      item.album = {
        name: result.album
      };
    }
    return item;
  }
};
