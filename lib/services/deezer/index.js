import { parse } from 'url';
import request from 'superagent';
import 'superagent-bluebird-promise';
import { match as urlMatch }  from './url';

export let id = 'deezer';

const apiRoot = 'https://api.deezer.com';

export const match = urlMatch;

export function parseUrl(url) {
  let matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);

  if (matches && matches[2]) {
    return module.exports.lookupId(matches[2], matches[1]);
  } else {
    throw new Error();
  }
};

export function* lookupId(id, type) {
  let path = '/' + type + '/' + id;

  let {body} = yield request.get(apiRoot + path).promise();
  if (!body || body.error) {
    let error = new Error('Not Found');
    error.status = 404;
    return Promise.reject(error);
  }
  let item = body;
  let coverUrl = item.cover || item.album.cover;
  let cover = 'test';
  // nasty hacks for superagent-bluebird-promise
  try {
    cover = yield request.get(coverUrl).redirects(0);
  } catch(err) {
    cover = err.originalError.response;
  }
  let artwork = {
    small: cover.headers.location.replace('120x120', '200x200'),
    large: cover.headers.location.replace('120x120', '800x800')
  };
  if (type === 'album') {
    return Promise.resolve({
      service: 'deezer',
      type: type,
      id: item.id,
      name: item.title,
      streamUrl: item.link,
      purchaseUrl: null,
      artwork: artwork,
      artist: {
        name: item.artist.name
      }
    });
  } else if (type === 'track') {
    return Promise.resolve({
      service: 'deezer',
      type: type,
      id: item.id,
      name: item.title,
      streamUrl: item.album.link,
      purchaseUrl: null,
      artwork: artwork,
      artist: {
        name: item.artist.name
      },
      album: {
        name: item.album.title
      }
    });
  } else {
    return Promise.reject(new Error());
  }
};

export function* search(data) {
  let cleanParam = function(str) {
    return str.replace(/[\:\?\&]+/, '');
  };
  let query, album;
  let {type} = data;

  if (type === 'album') {
    query = cleanParam(data.artist.name) + ' ' + cleanParam(data.name);
    album = data.name;
  } else if (type === 'track') {
    query = cleanParam(data.artist.name) + ' ' + cleanParam(data.albumName) + ' ' + cleanParam(data.name);
    album = data.albumName;
  }

  var path = '/search/' + type + '?q=' + encodeURIComponent(query);
  let response = yield request.get(apiRoot + path);
  if (response.body.data[0]) {
    return yield module.exports.lookupId(response.body.data[0].id, type);
  } else {
    var matches = album.match(/^[^\(\[]+/);
    if (matches && matches[0] && matches[0] !== album) {
      var cleanedData = JSON.parse(JSON.stringify(data));
      if (type === 'album') {
        cleanedData.name = matches[0].trim();
      } else if (type === 'track') {
        cleanedData.albumName = matches[0].trim();
      }
      return yield module.exports.search(cleanedData);
    } else {
      return Promise.resolve({service: 'deezer'});
    }
  }
};
