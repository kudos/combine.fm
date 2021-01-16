import urlMatch from './url.js';
import querystring from 'querystring';
import request from 'superagent';
import { parse } from 'url';
import debuglog from 'debug';

const debug = debuglog('combine.fm:ytmusic');

async function lookupTrack(id) {
  let endpoint = "https://www.youtube.com/get_video_info"
  let params = "?video_id=" + id + "&hl=en&el=detailpage"
  const { body } = await request.get(endpoint + params);

  if (body.player_response === undefined) {
    throw new Error();
  }
  let player_response = JSON.parse(body.player_response)
  let song_meta = player_response.videoDetails

  let description = song_meta.shortDescription.split("\n\n")
  let album_name = description[2]
  let artists = description[1].split(' · ')

  const artwork = {
    small: song_meta.thumbnail.thumbnails[0].url,
    large: song_meta.thumbnail.thumbnails[song_meta.thumbnail.thumbnails.length-1].url,
  };

  return Promise.resolve({
    service: 'ytmusic',
    type: 'track',
    id: song_meta.videoId,
    name: song_meta.title,
    streamUrl: null,
    purchaseUrl: null,
    artwork,
    artist: {
      name: artists.join(", "),
    },
    album: {
      name: album_name,
    },
  });
}

export async function lookupId(id, type) {
  if (type == 'track') {
    return lookupTrack(id)
  }
  return { service: 'ytmusic', id };
}

export function parseUrl(url) {
  const parsed = parse(url);
  const query = querystring.parse(parsed.query);
  let id = query.v;
  let list_id = query.list;
  let match;

  if (parsed.path.match(/^\/watch/) && id !== undefined) {
    return lookupId(id, 'track');
  } else if (match = parsed.path.match(/^\/browse\/([A-Za-z0-9_]+)/)) {
    return lookupId(match[1], 'album');
  } else if (match = parsed.path.match(/^\/playlist/) && list_id !== undefined) {
    if (list_id == 'OLAK5uy_lx9K5RpiBEwd3E4C1GKqY7e06qTlwydvs') { // TODO: Parse playlist correctly
      return lookupId('MPREb_9C36yscfgmJ', 'album');
    }
  }
  throw new Error();
}
export const id = 'ytmusic';
export const match = urlMatch;
