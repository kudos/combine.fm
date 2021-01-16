import urlMatch from './url.js';
import querystring from 'querystring';
import request from 'superagent';
import { parse } from 'url';
import debuglog from 'debug';

const debug = debuglog('combine.fm:ytmusic');

async function lookupTrack(id) {
  let endpoint = "https://www.youtube.com/get_video_info"
  const { body } = await request.get(endpoint).query({ video_id: id, hl: "en", el: "detailpage" })

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

async function lookupAlbum(id) {
  let request_body = {'browseEndpointContextSupportedConfigs': {'browseEndpointContextMusicConfig': {'pageType': 'MUSIC_PAGE_TYPE_ALBUM'}}, 'browseId': id, 'context': {'capabilities': {}, 'client': {'clientName': 'WEB_REMIX', 'clientVersion': '0.1', 'experimentIds': [], 'experimentsToken': '', 'gl': 'DE', 'hl': 'en', 'locationInfo': {'locationPermissionAuthorizationStatus': 'LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED'}, 'musicAppInfo': {'musicActivityMasterSwitch': 'MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE', 'musicLocationMasterSwitch': 'MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE', 'pwaInstallabilityStatus': 'PWA_INSTALLABILITY_STATUS_UNKNOWN'}, 'utcOffsetMinutes': 60}, 'request': {'internalExperimentFlags': [{'key': 'force_music_enable_outertube_tastebuilder_browse', 'value': 'true'}, {'key': 'force_music_enable_outertube_playlist_detail_browse', 'value': 'true'}, {'key': 'force_music_enable_outertube_search_suggestions', 'value': 'true'}], 'sessionIndex': {}}, 'user': {'enableSafetyMode': false}}}

  let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Content-Type": "application/json",
    "X-Goog-AuthUser": "0",
    "origin": "https://music.youtube.com",
    "X-Goog-Visitor-Id": "CgtWaTB2WWRDeEFUYyjhv-X8BQ%3D%3D"
  }

  const { body } = await request.post("https://music.youtube.com/youtubei/v1/browse?alt=json")
    .set(headers)
    .query({ alt: "json", key: "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30"}) // INNERTUBE_API_KEY from music.youtube.com
    .send(request_body)

  let data = body.frameworkUpdates.entityBatchUpdate.mutations
  let album_data = data.find((entry) => {
    if (entry.payload.musicAlbumRelease !== undefined) {
      return true
    }
    return false
  }).payload.musicAlbumRelease;
  let artists = data.filter((entry) => {
    if (entry.payload.musicArtist !== undefined) {
      if (album_data.primaryArtists.includes(entry.entityKey)) {
        return true
      }
    }
    return false
  }).map((entry) => entry.payload.musicArtist.name);

  const artwork = {
    small: album_data.thumbnailDetails.thumbnails[0].url,
    large: album_data.thumbnailDetails.thumbnails[album_data.thumbnailDetails.thumbnails.length-1].url,
  };
  return Promise.resolve({
    service: 'ytmusic',
    type: 'album',
    id,
    name: album_data.title,
    streamUrl: null,
    purchaseUrl: null,
    artwork,
    artist: {
      name: artists.join(", "),
    },
  });
}

export async function lookupId(id, type) {
  if (type == 'track') {
    return lookupTrack(id);
  } else if (type == 'album') {
    return lookupAlbum(id);
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
