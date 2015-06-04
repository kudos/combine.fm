import {parse} from 'url';
import querystring from 'querystring';
import request from 'superagent';
import 'superagent-bluebird-promise';

module.exports.id = 'itunes';

const apiRoot = 'https://itunes.apple.com';

module.exports.match = require('./url').match;

module.exports.parseUrl = function* (url) {
  let parsed = parse(url);
  let matches = parsed.path.match(/[\/]?([\/]?[a-z]{2}?)?[\/]+album[\/]+([^\/]+)[\/]+([^\?]+)/);
  let query = querystring.parse(parsed.query);

  if (matches) {
    let type = 'album';
    let id = matches[3].substr(2);
    if (query.i) {
      type = 'track';
      id = query.i;
    }
    return yield module.exports.lookupId(id, type, matches[1] || 'us');
  } else {
    return Promise.reject(new Error());
  }
};

module.exports.lookupId = function* (id, type, cc) {
  if (String(id).match(/^[a-z]{2}/)) {
    cc = id.substr(0, 2);
    id = id.substr(2);
  }

  let path = '/lookup?id=' + id;
  if (cc) {
    path = '/' + cc + path;
  }

  let response = yield request.get(apiRoot + path);
  let result = JSON.parse(response.text);

  if (!result.results || result.resultCount === 0 || !result.results[0].collectionId) {
    let error = new Error('Not Found');
    error.status = 404;
    return Promise.reject(error);
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

    return Promise.resolve(item);
  }
};

module.exports.search = function* (data) {
  let query, album, entity;
  let type = data.type;

  if (type === 'album') {
    query = data.artist.name + ' ' + data.name;
    album = data.name;
    entity = 'album';
  } else if (type === 'track') {
    query = data.artist.name + ' ' + data.album.name + ' ' + data.name;
    album = data.album.name;
    entity = 'musicTrack';
  }

  let path = '/search?term=' + encodeURIComponent(query) + '&media=music&entity=' + entity;
  let response = yield request.get(apiRoot + path);
  let result = JSON.parse(response.text);

  if (!result.results[0]) {
    let matches = album.match(/^[^\(\[]+/);
    if (matches && matches[0] && matches[0] !== album) {
      let cleanedData = JSON.parse(JSON.stringify(data));
      if (type === 'album') {
        cleanedData.name = matches[0].trim();
      } else if (type === 'track') {
        cleanedData.album.name = matches[0].trim();
      }
      return yield module.exports.search(cleanedData);
    } else {
      return Promise.resolve({service: 'itunes'});
    }
  } else {
    result = result.results[0];

    let item = {
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
    return Promise.resolve(item);
  }
};
