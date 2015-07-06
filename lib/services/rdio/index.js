'use strict';
var parse = require('url').parse;
var Promise = require('bluebird');

module.exports.id = 'rdio';

if (!process.env.RDIO_CLIENT_ID || !process.env.RDIO_CLIENT_SECRET || !process.env.RDIO_REFRESH_TOKEN) {
  console.warn('RDIO_CLIENT_ID, RDIO_REFRESH_TOKEN or RDIO_CLIENT_SECRET environment variables not found, deactivating Rdio.');
} else {

var Rdio = require('rdio');
var rdio = new Rdio({
  clientId: process.env.RDIO_CLIENT_ID,
  clientSecret: process.env.RDIO_CLIENT_SECRET,
  refreshToken: process.env.RDIO_REFRESH_TOKEN
});

var rdio = Promise.promisifyAll(rdio);

module.exports.match = require('./url').match;

module.exports.lookupId = function*(id) {
  yield rdio.loginAsync();
  var result = yield rdio.callAsync('getObjectFromShortCode', {'short_code': id});
  var parsedShortUrl = parse(result.shortUrl);
  var rid = parsedShortUrl.path.replace('/x/', '').replace('/', '');
  var type = result.album ? 'track' : 'album';

  var item = {
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

module.exports.parseUrl = function *(url) {
  var parsedUrl = parse(url);

  var method;
  var args;

  if (parsedUrl.host === 'rd.io') {
    method = 'getObjectFromShortCode';
    args = {'short_code': parsedUrl.path.replace('/x/', '').replace('/', '')};
  } else if (parsedUrl.host.match(/rdio\.com$/)) {
    method = 'getObjectFromUrl';
    args = {url: parsedUrl.path};
  } else {
    var error = new Error('Not Found');
    error.status = 404;
    throw error;
  }

  yield rdio.loginAsync();
  var result = yield rdio.callAsync(method, args);
  var parsedShortUrl = parse(result.shortUrl);
  var id = parsedShortUrl.path.replace('/x/', '').replace('/', '');
  var type = result.album ? 'track' : 'album';
  var item = {
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

module.exports.search = function *(data) {
  var query, albumClean;
  var type = data.type;

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

  yield rdio.loginAsync();
  var response = yield rdio.callAsync('search', {query: query, types: type});
  var result = response.results.filter(function(item) {
    if (type === 'album' && item.name.match(/([^\(\[]+)/)[0] === albumClean) {
      return item;
    } else if (type === 'track' && (item.album.match(/([^\(\[]+)/)[0] === albumClean || !albumClean)) {
      return item;
    }
  }).shift();

  if (!result) {
    var matches = albumClean.match(/^[^\(\[]+/);
    if (matches && matches[0] && matches[0] !== albumClean) {
      var cleanedData = JSON.parse(JSON.stringify(data));
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
    var parsedShortUrl = parse(result.shortUrl);
    var id = parsedShortUrl.path.replace('/x/', '').replace('/', '');
    var item = {
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

}
