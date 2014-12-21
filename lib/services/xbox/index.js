"use strict";
var parse = require('url').parse;
var Promise = require('bluebird');
var request = require('superagent');
require('superagent-bluebird-promise');

module.exports.id = "xbox";

if (!process.env.XBOX_CLIENT_ID || !process.env.XBOX_CLIENT_SECRET) {
  console.warn("XBOX_CLIENT_ID and XBOX_CLIENT_SECRET environment variables not found, deactivating Xbox Music.");
  return;
}

var credentials = {
  clientId: process.env.XBOX_CLIENT_ID,
  clientSecret: process.env.XBOX_CLIENT_SECRET
};

var apiRoot = "https://music.xboxlive.com/1/content";

var getAccessToken = function() {
  var authUrl = "https://datamarket.accesscontrol.windows.net/v2/OAuth2-13";
  var scope = "http://music.xboxlive.com";
  var grantType = "client_credentials";
  
  var data = {client_id: credentials.clientId, client_secret: credentials.clientSecret, scope: scope, grant_type: grantType};
  return request.post(authUrl).send(data).set('Content-type', 'application/x-www-form-urlencoded').promise().then(function(res) {
    return res.body.access_token;
  });
}

var formatResponse = function(res) {
  if (res.body.Tracks) {
    var result = res.body.Tracks.Items[0];
  } else {
    var result = res.body.Albums.Items[0];
  }
  var item = {
    service: "xbox",
    type: res.body.Tracks ? "track" : "album",
    id: result.Id,
    name: result.Name,
    streamUrl: result.Link,
    purchaseUrl: null,
    artwork: {
      small: result.ImageUrl + "?w=250",
      large: result.ImageUrl + "?w=500"
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

module.exports.match = require('./url').match;

module.exports.parseUrl = function(url) {
  var parsed = parse(url);
  var parts = parsed.path.split("/");
  var type = parts[1];
  var id = parts[4];

  return module.exports.lookupId("music." + id, type);
}

module.exports.lookupId = function(id, type) {
  return getAccessToken().then(function(access_token){
    var path = "/" + id + "/lookup";
    return request.get(apiRoot + path).set("Authorization", "Bearer " + access_token).promise().then(function(res) {
      return formatResponse(res);
    });
  });
};

module.exports.search = function(data) {
  var query, album;
  var type = data.type;

  if (type == "album") {
    query = data.artist.name + " " + data.name;
    album = data.name;
  } else if (type == "track") {
    query = data.artist.name + " " + data.name;
    album = data.album.name
  }

  return getAccessToken().then(function(access_token){
    var path = "/music/search?q=" + encodeURIComponent(query) + "&filters=" + type + "s";
    return request.get(apiRoot + path).set("Authorization", "Bearer " + access_token).promise().then(function(res) {
      return formatResponse(res);
    });
  });
};
