import { parse } from 'url';
import bluebird from 'bluebird';
import spotifyCB from 'spotify';
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

export function* search(data) {
  var cleanParam = function(str) {
    var chopChars = ['&', '[', '('];
    chopChars.forEach(function(chr) {
      if (data.artist.name.indexOf('&') > 0) {
        str = str.substring(0, data.artist.name.indexOf(chr));
      }
    })
    return str.replace(/[\:\?]+/, "");
  }
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = "artist:" + cleanParam(data.artist.name) + " album:" + cleanParam(data.name);
    album = data.name;
  } else if (type == "track") {
    query = "artist:" + cleanParam(data.artist.name) + " track:" + cleanParam(data.name) + ( cleanParam(data.albumName).length > 0 ? " album:" + cleanParam(data.albumName): "");
    album = data.albumName;
  }

  const results = yield spotify.searchAsync({query: query, type: type});
  if (!results[type + "s"].items[0]) {
    return {service: "spotify"};
  } else {
    let found;
    const choppedAlbum = data.type == "album" ? cleanParam(data.name) : cleanParam(data.albumName);
    if (!choppedAlbum.length) {
      return yield lookupId(results[type + "s"].items[0].id, type);
    }

    results[type + "s"].items.forEach(function(item) {
      const albumName = data.type == "album" ? item.name : item.album.name;
      const matches = albumName.match(/^[^\(\[]+/);
      if(choppedAlbum.indexOf(matches[0]) >= 0) {
        found = item;
      }
    });
    if (!found) {
      return {service: "spotify"};
    }
    return yield lookupId(results[type + "s"].items[0].id, type);
  }
}
