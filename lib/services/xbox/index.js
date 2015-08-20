import { parse } from 'url';
import querystring from 'querystring';
import request from 'superagent';
import 'superagent-bluebird-promise';
import { match as urlMatch }  from './url';

export let id = "xbox";

if (!process.env.XBOX_CLIENT_ID || !process.env.XBOX_CLIENT_SECRET) {
  console.warn("XBOX_CLIENT_ID and XBOX_CLIENT_SECRET environment variables not found, deactivating Xbox Music.");
}

const credentials = {
  clientId: process.env.XBOX_CLIENT_ID,
  clientSecret: process.env.XBOX_CLIENT_SECRET
};

const apiRoot = "https://music.xboxlive.com/1/content";

function* getAccessToken() {
  const authUrl = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13";
  const scope = "http://music.xboxlive.com";
  const grantType = "client_credentials";

  const data = {
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    scope: scope,
    grant_type: grantType
  };
  const result = yield request.post(authUrl).send(data).set('Content-type', 'application/x-www-form-urlencoded').promise();
  return result.body.access_token;
}

function formatResponse(res) {
  let result;
  if (res.body.Tracks) {
    result = res.body.Tracks.Items[0];
  } else {
    result = res.body.Albums.Items[0];
  }
  let item = {
    service: "xbox",
    type: res.body.Tracks ? "track" : "album",
    id: result.Id,
    name: result.Name,
    streamUrl: result.Link,
    purchaseUrl: null,
    artwork: {
      small: result.ImageUrl.replace("http://", "https://") + "&w=250&h=250",
      large: result.ImageUrl.replace("http://", "https://") + "&w=500&h=250"
    },
    artist: {
      name: result.Artists[0].Artist.Name
    }
  };
  if (result.Album) {
    item.album = {name: result.Album.Name}
  }
  return item;
}

export const match = urlMatch;

export function* parseUrl(url) {
  const parsed = parse(url);
  const parts = parsed.path.split("/");
  const type = parts[1];
  const idMatches = parts[4].match(/[\w\-]+/);
  const id = idMatches[0];
  if (!id) {
    return false;
  }
  return yield lookupId("music." + id, type);
}

export function* lookupId(id, type) {
  const access_token = yield getAccessToken();
  const path = "/" + id + "/lookup";
  const result = yield request.get(apiRoot + path).set("Authorization", "Bearer " + access_token).promise();
  return result ? formatResponse(result) : {service: "xbox"};
};

export function* search(data) {
  var cleanParam = function(str) {
    return str.replace(/[\:\?\&]+/, "");
  }
  let query, album;
  const type = data.type;

  if (type == "album") {
    query = cleanParam(data.artist.name.substring(0, data.artist.name.indexOf('&'))) + " " + cleanParam(data.name);
    album = data.name;
  } else if (type == "track") {
    query = cleanParam(data.artist.name.substring(0, data.artist.name.indexOf('&'))) + " " + cleanParam(data.name);
    album = data.album.name
  }
  const access_token = yield getAccessToken();
  const path = "/music/search?q=" + encodeURIComponent(query) + "&filters=" + type + "s";
  const result = yield request.get(apiRoot + path).set("Authorization", "Bearer " + access_token).promise()
  return result ? formatResponse(result) : {service: "xbox"};
};
