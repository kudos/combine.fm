import { parse } from 'url';
import bluebird from 'bluebird';
import spotifyCB from 'spotify';
import request from 'superagent';
import 'superagent-bluebird-promise';
const spotify = bluebird.promisifyAll(spotifyCB);
import { match as urlMatch }  from './url';

export let id = "spotify";

export const match = urlMatch;

export function* parseUrl(url) {
  var matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);

  if (matches && matches[2]) {
    return yield lookupId(matches[2], matches[1]);
  }
}

export function* lookupId(id, type) {
  const data = yield spotify.lookupAsync({id: id, type: type});
  if (data.error) {
    var error = new Error("Not Found");
    error.status = 404;
    throw error;
  }

  var artist = data.artists[0];

  if (type == "album") {
    return {
      service: "spotify",
      type: type,
      id: data.id,
      name: data.name,
      streamUrl: "https://play.spotify.com/" + type + "/" + data.id,
      purchaseUrl: null,
      artwork: {
        small: data.images[1].url.replace("http:", "https:"),
        large: data.images[0].url.replace("http:", "https:"),
      },
      artist: {
        name: artist.name
      }
    };
  } else if (type == "track") {
    return {
      service: "spotify",
      type: type,
      id: data.id,
      name: data.name,
      streamUrl: "https://play.spotify.com/" + type + "/" + data.id,
      purchaseUrl: null,
      artwork: {
        small: data.album.images[1].url.replace("http:", "https:"),
        large: data.album.images[0].url.replace("http:", "https:"),
      },
      artist: {
        name: artist.name
      },
      album: {
        name: data.album.name
      }
    };
  }
}

export function* search(data, original={}) {
  const markets = ['US', 'GB', 'JP', 'BR', 'DE', 'ES'];
  const cleanParam = function(str) {
    var chopChars = ['&', '[', '('];
    chopChars.forEach(function(chr) {
      if (data.artist.name.indexOf('&') > 0) {
        str = str.substring(0, data.artist.name.indexOf(chr));
      }
    })
    return str.replace(/[\:\?]+/, "");
  }
  let query, album;
  const type = data.type;

  if (type == "album") {
    query = "artist:" + cleanParam(data.artist.name) + " album:" + cleanParam(data.name);
    album = data.name;
  } else if (type == "track") {
    query = "artist:" + cleanParam(data.artist.name) + " track:" + cleanParam(data.name) + ( cleanParam(data.albumName).length > 0 ? " album:" + cleanParam(data.albumName): "");
    album = data.albumName;
  }

  for (let market of markets) {
    const response = yield request.get('https://api.spotify.com/v1/search?type=' + type + '&q=' + encodeURI(query) + '&market=' + market);
    const items = response.body[type + 's'].items;

    const name = original.name || data.name;

    let match;
    if (!(match = exactMatch(name, items, type))) {
      match = looseMatch(name, items, type);
    }

    if (match) {
      if (type === 'album') {
        return yield lookupId(match.id, type);
      } else if (type === 'track') {
        return yield lookupId(match.id, type);
      }
    }
  }
  return {service: "spotify"};
}

function exactMatch(needle, haystack, type) {
  // try to find exact match
  return haystack.find(function(entry) {
    if (entry.type !== type) {
      return false;
    }

    if (entry.name === needle) {
      return entry;
    }
  });
}

function looseMatch(needle, haystack, type) {
  // try to find exact match
  return haystack.find(function(entry) {
    if (entry.type !== type) {
      return false;
    }

    if (entry.name.indexOf(needle) >= 0) {
      return entry
    }
  });
}
