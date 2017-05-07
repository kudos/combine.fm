import { parse } from 'url';
import querystring from 'querystring';
import request from 'superagent';
import 'superagent-bluebird-promise';
import { match as urlMatch }  from './url';

export let id = 'itunes';

const apiRoot = 'https://itunes.apple.com';

export const match = urlMatch;

export function* parseUrl(url) {
  const parsed = parse(url);
  const matches = parsed.path.match(/[\/]?([\/]?[a-z]{2}?)?[\/]+album[\/]+([^\/]+)[\/]+([^\?]+)/);
  const query = querystring.parse(parsed.query);

  if (matches) {
    let type = 'album';
    let id = matches[3].substr(2);
    if (query.i) {
      type = 'track';
      id = query.i;
    }
    return yield module.exports.lookupId(id, type, matches[1] || 'us');
  } else {
    throw new Error();
  }
};

export function* lookupId(id, type, cc) {
  if (String(id).match(/^[a-z]{2}/)) {
    cc = id.substr(0, 2);
    id = id.substr(2);
  }

  let path = '/lookup?id=' + id;
  if (cc) {
    path = '/' + cc + path;
  }

  const response = yield request.get(apiRoot + path);
  let result = JSON.parse(response.text);

  if (!result.results || result.resultCount === 0 || !result.results[0].collectionId) {
    const error = new Error('Not Found');
    error.status = 404;
    throw error;
  } else {
    result = result.results[0];

    let item = {
      service: 'itunes',
      type: type,
      id: cc + id,
      name: result.trackName ? result.trackName : result.collectionName,
      streamUrl: null,
      purchaseUrl: result.collectionViewUrl,
      artwork: {
        small: 'https://match.audio/itunes/' + result.artworkUrl100.replace('100x100', '200x200').replace('http://', ''),
        large: 'https://match.audio/itunes/' + result.artworkUrl100.replace('100x100', '600x600').replace('http://', '')
      },
      artist: {
        name: result.artistName
      }
    };

    if (type === 'track') {
      item.album = {
        name: result.collectionName
      };
    }

    return item;
  }
};

export function* search(data) {
  let query, album, entity;
  const type = data.type;

  if (type === 'album') {
    query = data.artist.name + ' ' + data.name;
    album = data.name;
    entity = 'album';
  } else if (type === 'track') {
    query = data.artist.name + ' ' + data.albumName + ' ' + data.name;
    album = data.albumName;
    entity = 'musicTrack';
  }

  const path = '/search?term=' + encodeURIComponent(query) + '&media=music&entity=' + entity;
  const response = yield request.get(apiRoot + path);
  let result = JSON.parse(response.text);

  if (!result.results[0]) {
    const matches = album.match(/^[^\(\[]+/);
    if (matches && matches[0] && matches[0] !== album) {
      const cleanedData = JSON.parse(JSON.stringify(data));
      if (type === 'album') {
        cleanedData.name = matches[0].trim();
      } else if (type === 'track') {
        cleanedData.albumName = matches[0].trim();
      }
      return yield search(cleanedData);
    } else {
      return {service: 'itunes'};
    }
  } else {
    result = result.results[0];

    const item = {
      service: 'itunes',
      type: type,
      id: 'us' + result.collectionId,
      name: result.trackName ? result.trackName : result.collectionName,
      streamUrl: null,
      purchaseUrl: result.collectionViewUrl,
      artwork: {
        small: 'https://match.audio/itunes/' + result.artworkUrl100.replace('100x100', '200x200').replace('http://', ''),
        large: 'https://match.audio/itunes/' + result.artworkUrl100.replace('100x100', '600x600').replace('http://', '')
      },
      artist: {
        name: result.artistName
      }
    };

    if (type === 'track') {
      item.album = {
        name: result.collectionName
      };
    }
    return item;
  }
};
