import { parse } from 'url';
import querystring from 'querystring';
import moment from 'moment';
import request from 'superagent';
import 'superagent-bluebird-promise';
import { match as urlMatch }  from './url';
import freebase from './freebase';

import debuglog from 'debug';
const debug = debuglog('match.audio:youtube');

module.exports.id = 'youtube';

if (!process.env.YOUTUBE_KEY) {
  console.warn('YOUTUBE_KEY environment variable not found, deactivating Youtube.');
}

const credentials = {
  key: process.env.YOUTUBE_KEY,
};

const apiRoot = 'https://www.googleapis.com/youtube/v3';

export const match = urlMatch;

export function parseUrl(url) {
  const parsed = parse(url);
  const query = querystring.parse(parsed.query);
  let id = query.v;

  if (!id) {
    id = parsed.path.substr(1);
    if (!id) {
      throw new Error();
    }
  }
  return lookupId(id, 'track');
}

export function* lookupId(id, type) {

  const path = '/videos?part=snippet%2CtopicDetails%2CcontentDetails&id=' + id + '&key=' + credentials.key;
  try {
    const result = yield request.get(apiRoot + path).promise();
    const item = result.body.items[0];
    if (!item.topicDetails.topicIds) {
      return {service: 'youtube'};
    }

    const match = {
      id: id,
      service: 'youtube',
      name: item.snippet.title,
      type: 'track',
      album: {name: ''},
      streamUrl: 'https://youtu.be/' + id,
      purchaseUrl: null,
      artwork: {
        small: item.snippet.thumbnails.medium.url,
        large: item.snippet.thumbnails.high.url,
      }
    };

    for (let topic of yield freebase.get(topicId)) {
      const musicalArtist = topic.property['/type/object/type'].values.some((value) => {
        return value.text == 'Musical Artist';
      });

      const musicalRecording = topic.property['/type/object/type'].values.some(function(value) {
        return value.text == 'Musical Recording';
      });

      const musicalAlbum = topic.property['/type/object/type'].values.some(function(value) {
        return value.text == 'Musical Album';
      })

      if (musicalArtist) {
        match.artist = {name: topic.property['/type/object/name'].values[0].text};
      } else if (musicalRecording) {
        match.name = topic.property['/type/object/name'].values[0].text;
        if (topic.property['/music/recording/releases']) {
          match.type = 'album';
          match.album.name = topic.property['/music/recording/releases'].values[0].text;
        }
      } else if (musicalAlbum) {
        match.name = topic.property['/type/object/name'].values[0].text;
        match.type = 'album';
      }
    }
    return match;
  } catch (e) {
    debug(e.body);
    return {'service': 'youtube'};
  }
};

export function* search(data) {
  let query, album;
  const type = data.type;

  if (type == 'album') {
    query = data.artist.name + ' ' + data.name;
    album = data.name;
  } else if (type == 'track') {
    query = data.artist.name + ' ' + data.name;
    album = data.album.name
  }

  const path = '/search?part=snippet&q=' + encodeURIComponent(query) + '&type=video&videoCaption=any&videoCategoryId=10&key=' + credentials.key;
  const result = yield request.get(apiRoot + path).promise();
  const item = result.body.items[0];

  if (!item) {
    return {service:'youtube', type: 'video'};
  } else {
    return {
      service: 'youtube',
      type: 'video',
      id: item.id.videoId,
      name: item.snippet.title,
      streamUrl: 'https://www.youtube.com/watch?v=' + item.id.videoId,
      purchaseUrl: null,
      artwork: {
        small: item.snippet.thumbnails.medium.url,
        large: item.snippet.thumbnails.high.url,
      }
    };
  }
};
