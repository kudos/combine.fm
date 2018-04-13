import { parse } from 'url';
import SpotifyWebApi from 'spotify-web-api-node';
import urlMatch from './url';

const spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'https://combine.fm',
});


function exactMatch(needle, haystack, type) {
  // try to find exact match
  return haystack.find((entry) => {
    if (entry.type !== type) {
      return false;
    }

    if (entry.name === needle) {
      return entry;
    }
    return false;
  });
}

function looseMatch(needle, haystack, type) {
  // try to find exact match
  return haystack.find((entry) => {
    if (entry.type !== type) {
      return false;
    }

    if (entry.name.indexOf(needle) >= 0) {
      return entry;
    }
    return false;
  });
}

export async function lookupId(id, type) {
  const token = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(token.body.access_token);
  let data = await spotify[`get${type.charAt(0).toUpperCase()}${type.slice(1)}s`]([id]);

  data = data.body[`${type}s`][0];

  const artist = data.artists[0];

  if (type === 'album') {
    return {
      service: 'spotify',
      type,
      id: data.id,
      name: data.name,
      streamUrl: `https://play.spotify.com/${type}/${data.id}`,
      purchaseUrl: null,
      artwork: {
        small: data.images[1].url.replace('http:', 'https:'),
        large: data.images[0].url.replace('http:', 'https:'),
      },
      artist: {
        name: artist.name,
      },
    };
  } else if (type === 'track') {
    return {
      service: 'spotify',
      type,
      id: data.id,
      name: data.name,
      streamUrl: `https://play.spotify.com/${type}/${data.id}`,
      purchaseUrl: null,
      artwork: {
        small: data.album.images[1].url.replace('http:', 'https:'),
        large: data.album.images[0].url.replace('http:', 'https:'),
      },
      artist: {
        name: artist.name,
      },
      album: {
        name: data.album.name,
      },
    };
  }
  return { service: 'spotify' };
}

export async function search(data, original = {}) {
  const token = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(token.body.access_token);

  const markets = ['US', 'GB', 'JP', 'BR', 'DE', 'ES'];
  function cleanParam(str) {
    const chopChars = ['&', '[', '('];
    chopChars.forEach((chr) => {
      if (data.artist.name.indexOf('&') > 0) {
        str = str.substring(0, data.artist.name.indexOf(chr)); // eslint-disable-line no-param-reassign,max-len
      }
    });
    return str.replace(/[:?]+/, '');
  }
  let query;
  const type = data.type;

  if (type === 'album') {
    query = `artist:${cleanParam(data.artist.name)} album:${cleanParam(data.name)}`;
  } else if (type === 'track') {
    query = `artist:${cleanParam(data.artist.name)} track:${cleanParam(data.name)}${cleanParam(data.albumName).length > 0 ? ` album:${cleanParam(data.albumName)}` : ''}`;
  }

  for (const market of markets) { // eslint-disable-line
    const response = await spotify[`search${type.charAt(0).toUpperCase()}${type.slice(1)}s`](query, { market });

    const items = response.body[`${type}s`].items;

    const name = original.name || data.name;

    let match = exactMatch(name, items, type);
    if (!match) {
      match = looseMatch(name, items, type);
    }

    if (match) {
      if (type === 'album') {
        return await lookupId(match.id, type);
      } else if (type === 'track') {
        return await lookupId(match.id, type);
      }
    }
  }
  return { service: 'spotify' };
}

export async function parseUrl(url) {
  const matches = parse(url).path.match(/\/(album|track)[/]+([A-Za-z0-9]+)/);

  if (matches && matches[2]) {
    return await lookupId(matches[2], matches[1]);
  }
  throw new Error();
}

export const id = 'spotify';
export const match = urlMatch;
