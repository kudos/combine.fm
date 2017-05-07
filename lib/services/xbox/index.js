import { parse } from 'url';
import querystring from 'querystring';
import request from 'superagent';
import 'superagent-bluebird-promise';
import { match as urlMatch }  from './url';

import debuglog from 'debug';
const debug = debuglog('match.audio:xbox');

export let id = 'xbox';

if (!process.env.XBOX_CLIENT_ID || !process.env.XBOX_CLIENT_SECRET) {
  console.warn('XBOX_CLIENT_ID and XBOX_CLIENT_SECRET environment variables not found, deactivating Xbox Music.');
}

const credentials = {
  clientId: process.env.XBOX_CLIENT_ID,
  clientSecret: process.env.XBOX_CLIENT_SECRET
};

const apiRoot = 'https://music.xboxlive.com/1/content';

function* getAccessToken() {
  const authUrl = 'https://login.live.com/accesstoken.srf';
  const scope = 'app.music.xboxlive.com';
  const grantType = 'client_credentials';

  const data = {
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    scope: scope,
    grant_type: grantType
  };
  const result = yield request.post(authUrl).timeout(10000).send(data).set('Content-type', 'application/x-www-form-urlencoded').promise();
  return result.body.access_token;
}

function formatResponse(match) {
  const item = {
    service: 'xbox',
    type: match.Album ? 'track' : 'album',
    id: match.Id,
    name: match.Name,
    streamUrl: match.Link,
    purchaseUrl: null,
    artwork: {
      small: match.ImageUrl.replace('http://', 'https://') + '&w=250&h=250',
      large: match.ImageUrl.replace('http://', 'https://') + '&w=500&h=500'
    },
    artist: {
      name: match.Artists[0].Artist.Name
    }
  };
  if (match.Album) {
    item.album = {name: match.Album.Name}
  }
  return item;
}

function* apiCall(path) {
  const access_token = yield getAccessToken();
  return request.get(apiRoot + path).timeout(10000).set('Authorization', 'Bearer ' + access_token).promise();
}

export const match = urlMatch;

export function* parseUrl(url) {
  const parsed = parse(url);
  const parts = parsed.path.split('/');
  const type = parts[1];
  const idMatches = parts[4].match(/[\w\-]+/);
  const id = idMatches[0];
  if (!id) {
    return false;
  }
  return yield lookupId('music.' + id, type);
}

export function* lookupId(id, type) {
  const path = '/' + id + '/lookup';
  const apiType = type.charAt(0).toUpperCase() + type.substr(1) + 's';
  try {
    const result = yield apiCall(path);
    return formatResponse(result.body[apiType].Items[0]);
  } catch (e) {
    if (e.status !== 404) {
      debug(e.body);
    }
    return {service: 'xbox'};
  }
};

export function* search(data) {
  var cleanParam = function(str) {
    return str.replace(/[\:\?\&\(\)\[\]]+/g, '');
  }
  let query, album;
  const type = data.type;

  if (type == 'album') {
    query = cleanParam(data.artist.name.substring(0, data.artist.name.indexOf('&'))) + ' ' + cleanParam(data.name);
    album = data.name;
  } else if (type == 'track') {
    query = cleanParam(data.artist.name.substring(0, data.artist.name.indexOf('&'))) + ' ' + cleanParam(data.name);
    album = data.albumName
  }

  const name = data.name;

  const path = '/music/search?q=' + encodeURIComponent(query) + '&filters=' + type + 's';
  const result = yield apiCall(path);

  const apiType = type.charAt(0).toUpperCase() + type.substr(1) + 's';

  let match = exactMatch(name, data.artist.name, result.body[apiType].Items, type);
  if (!match) {
    match = looseMatch(name, data.artist.name, result.body[apiType].Items, type);
  }

  if (match) {
    return formatResponse(match);
  }

  return {service: 'xbox'};
};

function exactMatch(item, artist, haystack, type) {
    // try to find exact match
  return haystack.find(function(entry) {
    if (entry.Name === item && entry.Artists[0].Artist.Name === artist) {
      return entry;
    }
  });
}

function looseMatch(item, artist, haystack, type) {
    // try to find exact match
  return haystack.find(function(entry) {
    console.log(entry.Name, entry.Artists[0].Artist.Name)
    if (entry.Name.indexOf(item) >= 0 && entry.Artists[0].Artist.Name.indexOf(artist) >= 0) {
      return entry;
    }
  });
}
