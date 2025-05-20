import urlMatch from "./url.js";
import querystring from "querystring";
import request from "superagent";
import { parse } from "url";
import debuglog from "debug";

const debug = debuglog("combine.fm:ytmusic");

const standard_body = {
  context: {
    capabilities: {},
    client: {
      clientName: "WEB_REMIX",
      clientVersion: "1.20250514.03.00",
      experimentIds: [],
      experimentsToken: "",
      gl: "DE",
      hl: "en",
      locationInfo: {
        locationPermissionAuthorizationStatus:
          "LOCATION_PERMISSION_AUTHORIZATION_STATUS_UNSUPPORTED"
      },
      musicAppInfo: {
        musicActivityMasterSwitch: "MUSIC_ACTIVITY_MASTER_SWITCH_INDETERMINATE",
        musicLocationMasterSwitch: "MUSIC_LOCATION_MASTER_SWITCH_INDETERMINATE",
        pwaInstallabilityStatus: "PWA_INSTALLABILITY_STATUS_UNKNOWN"
      },
      utcOffsetMinutes: 60
    },
    request: {
      internalExperimentFlags: [
        {
          key: "force_music_enable_outertube_tastebuilder_browse",
          value: "true"
        },
        {
          key: "force_music_enable_outertube_playlist_detail_browse",
          value: "true"
        },
        {
          key: "force_music_enable_outertube_search_suggestions",
          value: "true"
        }
      ],
      sessionIndex: {}
    },
    user: { enableSafetyMode: false }
  }
};

// {"context":{"client":{"hl":"en","gl":"IE","remoteHost":"109.255.114.183","deviceMake":"","deviceModel":"","visitorData":"Cgs1WHNrQ2ZJSlZQYyju17HBBjInCgJJRRIhEh0SGwsMDg8QERITFBUWFxgZGhscHR4fICEiIyQlJiBG","userAgent":"Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0,gzip(gfe)","clientName":"WEB_REMIX","clientVersion":"1.20250514.03.00","osName":"X11","osVersion":"","originalUrl":"https://music.youtube.com/youtube/v1/search","screenPixelDensity":2,"platform":"DESKTOP","clientFormFactor":"UNKNOWN_FORM_FACTOR","configInfo":{"appInstallData":"CO7XscEGEOGCgBMQpZ3PHBDtoM8cEP7z_xIQmvTOHBCJsM4cEIeszhwQ2vfOHBDM364FEL2azxwQgc3OHBCLgoATEN68zhwQyfevBRDn484cEJmNsQUQvoqwBRDvnc8cEO79zhwQ6-j-EhCd0LAFEN-4zhwQ6ZvPHBD8ss4cEODczhwQnJvPHBD-ns8cELvZzhwQt-r-EhC0jIATEOK4sAUQgoS4IhDJ5rAFEPDizhwQiIewBRC9tq4FEJT-sAUQmZixBRC52c4cEIjjrwUQ9quwBRC9mbAFELCJzxwQ9v7_EhDwnLAFENeczxwQ0-GvBRDMic8cEOTn_xIQ4Z7PHBC45M4cEODg_xIQoaHPHBCb-M4cKixDQU1TR3hVUW9MMndETkhrQnBTQ0V0WFM2Z3Y1N0FQSjNBV2hwQVFkQnc9PQ%3D%3D","coldConfigData":"CO7XscEGGjJBT2pGb3gzcE9TeHpiVUxCMkdoT0xCZHI0eThDNVRLSTN4OXhLVXR0V2h0RGJaZmZnZyIyQU9qRm94MXFoUkxFb2JKVzlJd2dWZm8wVWJJbHNrTTllQUZyVF81UkJBZHZSSTRjTmc%3D","coldHashData":"CO7XscEGEhM4MzcyMjg4Nzg1MDY2MDg0NzkyGO7XscEGMjJBT2pGb3gzcE9TeHpiVUxCMkdoT0xCZHI0eThDNVRLSTN4OXhLVXR0V2h0RGJaZmZnZzoyQU9qRm94MXFoUkxFb2JKVzlJd2dWZm8wVWJJbHNrTTllQUZyVF81UkJBZHZSSTRjTmc%3D","hotHashData":"CO7XscEGEhQxMTE4MDExNDAyNDI2OTEwMTQxMxju17HBBjIyQU9qRm94M3BPU3h6YlVMQjJHaE9MQmRyNHk4QzVUS0kzeDl4S1V0dFdodERiWmZmZ2c6MkFPakZveDFxaFJMRW9iSlc5SXdnVmZvMFViSWxza005ZUFGclRfNVJCQWR2Ukk0Y05n"},"screenDensityFloat":2,"userInterfaceTheme":"USER_INTERFACE_THEME_DARK","timeZone":"Europe/Dublin","browserName":"Firefox","browserVersion":"138.0","acceptHeader":"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8","deviceExperimentId":"ChxOelV3TmpRNU16TTFNRGMxTXpjNU9EZzBPQT09EO7XscEGGO7XscEG","rolloutToken":"CODP7vvb9ci_dRC-iJ6MorWMAxi-vbDI7q-NAw%3D%3D","screenWidthPoints":1440,"screenHeightPoints":434,"utcOffsetMinutes":60,"musicAppInfo":{"pwaInstallabilityStatus":"PWA_INSTALLABILITY_STATUS_UNKNOWN","webDisplayMode":"WEB_DISPLAY_MODE_BROWSER","storeDigitalGoodsApiSupportStatus":{"playStoreDigitalGoodsApiSupportStatus":"DIGITAL_GOODS_API_SUPPORT_STATUS_UNSUPPORTED"}}},"user":{"lockedSafetyMode":false},"request":{"useSsl":true,"internalExperimentFlags":[],"consistencyTokenJars":[]},"adSignalsInfo":{"params":[{"key":"dt","value":"1747741679421"},{"key":"flash","value":"0"},{"key":"frm","value":"0"},{"key":"u_tz","value":"60"},{"key":"u_his","value":"2"},{"key":"u_h","value":"960"},{"key":"u_w","value":"1440"},{"key":"u_ah","value":"960"},{"key":"u_aw","value":"1440"},{"key":"u_cd","value":"24"},{"key":"bc","value":"31"},{"key":"bih","value":"434"},{"key":"biw","value":"1440"},{"key":"brdim","value":"0,0,0,0,1440,0,1440,928,1440,434"},{"key":"vis","value":"1"},{"key":"wgl","value":"true"},{"key":"ca_type","value":"image"}]}},"query":"banger","suggestStats":{"validationStatus":"VALID","parameterValidationStatus":"VALID_PARAMETERS","clientName":"youtube-music","searchMethod":"ENTER_KEY","inputMethods":["KEYBOARD"],"originalQuery":"banger","availableSuggestions":[{"index":0,"type":0},{"index":1,"type":0},{"index":2,"type":0},{"index":3,"type":0},{"index":4,"type":0},{"index":5,"type":0},{"index":6,"type":46},{"index":7,"type":46},{"index":8,"type":46}],"zeroPrefixEnabled":true,"firstEditTimeMsec":13046,"lastEditTimeMsec":14576}}

const standard_headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.5",
  "Content-Type": "application/json",
  "X-Goog-AuthUser": "0",
  origin: "https://music.youtube.com",
  "X-Goog-Visitor-Id": "CgtWaTB2WWRDeEFUYyjhv-X8BQ%3D%3D"
};
const standard_params = {
  alt: "json",
  key: "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30"
}; // INNERTUBE_API_KEY from music.youtube.com

const base_filter = "Eg-KAQwIA";
const albums_filter = "BAAGAEgACgA";
const tracks_filter = "RAAGAAgACgA";
// If you make a typo, ytmusic searches for a correction. With this filter it will look for the exact match
// since we don't let users type, no sense in letting it autocorrect
const exact_search_filter = "MABqChAEEAMQCRAFEAo%3D";

// The logic here comes from https://github.com/sigma67/ytmusicapi
// If something doesn't work, looking up back there might be a good idea.
export async function search(data, original = {}) {
  let query;
  const various =
    data.artist.name === "Various Artists" || data.artist.name === "Various";
  if (various) {
    data.artist.name = "";
  }
  if (data.type == "track") {
    query = [data.name, data.artist.name, data.albumName];
  } else if (data.type == "album") {
    query = [data.name, data.artist.name];
  } else {
    throw new Error();
  }
  // Add "" to try and make the search better, works for stuff like "The beatles" to reduce noise
  query = query
    .filter(String)
    .map(entry => '"' + entry + '"')
    .join(" ");

  let params =
    base_filter +
    (data.type == "track" ? tracks_filter : albums_filter) +
    exact_search_filter;
  let request_body = { query, params, ...standard_body };

  try {
    const { body } = await request
      .post("https://music.youtube.com/youtubei/v1/search")
      .set(standard_headers)
      .query(standard_params)
      .send(request_body);
  } catch (err) {
    debug(err);
  }

  // no results
  if (body.contents === undefined) {
    debug("Empty body, no results");
    return { service: "ytmusic" };
  }

  let results;
  if (body.contents.tabbedSearchResultsRenderer !== undefined) {
    results =
      body.contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content;
  } else {
    results = body.contents.sectionListRenderer.contents;
  }

  // no results
  if (results.length == 1 && results.itemSectionRenderer !== undefined) {
    debug("Only itemSectionRenderer, no results");
    return { service: "ytmusic" };
  }

  for (const result of results) {
    if (result.musicShelfRenderer === undefined) {
      continue;
    }

    const matches = parse_result_content(
      result.musicShelfRenderer.contents,
      data.type
    );
    // This could probably be done without extra lookups, but it would involve parsing deeply the response.
    // If there's some kind of rate limit on ytmusic's side, this is a good play to start refactoring
    for (const match of matches) {
      const possibleMatch = await lookupId(match, data.type);
      const nameMatch = possibleMatch.name == data.name;
      const artistMatch =
        data.artist.name == ""
          ? possibleMatch.artist.name === "Various Artists"
          : data.artist.name == possibleMatch.artist.name;
      if (nameMatch && artistMatch) {
        return possibleMatch;
      }
    }
  }
  debug("Finished looking up, no results");
  return { service: "ytmusic" };
}

function parse_result_content(contents, type) {
  let matches = [];
  for (const result of contents) {
    const data = result.musicResponsiveListItemRenderer;
    const informed_type =
      data.flexColumns[1].musicResponsiveListItemFlexColumnRenderer.text.runs[0]
        .text;
    if (["Video", "Playlist"].includes(informed_type)) {
      continue;
    }
    let matchId;
    if (type == "track") {
      matchId =
        data.overlay?.musicItemThumbnailOverlayRenderer.content
          .musicPlayButtonRenderer.playNavigationEndpoint.watchEndpoint
          ?.videoId;
    } else if (type == "album") {
      matchId = data.navigationEndpoint?.browseEndpoint.browseId;
    }
    if (matchId) {
      matches.push(matchId);
    }
  }

  return matches;
}

async function lookupTrack(id) {
  let request_body = { video_id: id, ...standard_body };

  const { body } = await request
    .post("https://music.youtube.com/youtubei/v1/player")
    .set(standard_headers)
    .query(standard_params)
    .send(request_body);
  let song_meta = body.videoDetails;

  let description = body.microformat.microformatDataRenderer.description.split(
    " · "
  );
  let possible_album_name = description[description.length - 1].split("℗")[0];
  if (!description[description.length - 1].includes("℗")) {
    possible_album_name = "";
  }
  let tags = body.microformat.microformatDataRenderer.tags;
  let album_name = "";
  for (const tag of tags) {
    if (possible_album_name.includes(tag)) {
      album_name = tag;
    }
  }
  let artists = song_meta.author;
  artists = artists.replace(" - Topic", "");

  const artwork = {
    small: song_meta.thumbnail.thumbnails[0].url,
    large:
      song_meta.thumbnail.thumbnails[song_meta.thumbnail.thumbnails.length - 1]
        .url
  };

  let track_info = {
    service: "ytmusic",
    type: "track",
    id: song_meta.videoId,
    name: song_meta.title,
    streamUrl: `https://music.youtube.com/watch?v=${song_meta.videoId}`,
    purchaseUrl: null,
    artwork,
    artist: {
      name: artists
    },
    album: {
      name: album_name
    }
  };
  return Promise.resolve(track_info);
}

async function lookupAlbum(id) {
  let request_body = {
    browseEndpointContextSupportedConfigs: {
      browseEndpointContextMusicConfig: { pageType: "MUSIC_PAGE_TYPE_ALBUM" }
    },
    browseId: id,
    ...standard_body
  };

  const { body } = await request
    .post("https://music.youtube.com/youtubei/v1/browse")
    .set(standard_headers)
    .query(standard_params)
    .send(request_body);

  let data = body.frameworkUpdates?.entityBatchUpdate.mutations;

  if (data === undefined) {
    throw new Error();
  }
  let album_data = data.find(entry => {
    if (entry.payload.musicAlbumRelease !== undefined) {
      return true;
    }
    return false;
  }).payload.musicAlbumRelease;
  let artists;
  if (album_data.primaryArtists) {
    artists = data
      .filter(entry => {
        if (entry.payload.musicArtist !== undefined) {
          if (album_data.primaryArtists.includes(entry.entityKey)) {
            return true;
          }
        }
        return false;
      })
      .map(entry => entry.payload.musicArtist.name);
  } else {
    // Various artists, most likely
    artists = [album_data.artistDisplayName];
  }

  const artwork = {
    small: album_data.thumbnailDetails.thumbnails[0].url,
    large:
      album_data.thumbnailDetails.thumbnails[
        album_data.thumbnailDetails.thumbnails.length - 1
      ].url
  };
  return Promise.resolve({
    service: "ytmusic",
    type: "album",
    id,
    name: album_data.title,
    streamUrl: null,
    streamUrl: `https://music.youtube.com/browse/${id}`,
    purchaseUrl: null,
    artwork,
    artist: {
      name: artists.join(", ")
    },
    playlistId: album_data.audioPlaylistId
  });
}

async function lookupPlaylist(id) {
  const endpoint = "https://music.youtube.com/playlist";
  const response = await request
    .get(endpoint)
    .set(standard_headers)
    .query({ list: id });
  let match = response.text.match(/"MPRE[_a-zA-Z0-9]+/);
  let albumId;
  if (match) {
    albumId = match[0].substr(1);
  } else {
    debug("Couldn't match album id");
    throw new Error();
  }
  const possibleAlbum = await lookupAlbum(albumId);
  if ((possibleAlbum.playlistId = id)) {
    return possibleAlbum;
  }
  throw new Error();
}

export async function lookupId(id, type) {
  if (type == "track") {
    return lookupTrack(id);
  } else if (type == "album") {
    return lookupAlbum(id);
  } else if (type == "playlist") {
    return lookupPlaylist(id);
  }
  return { service: "ytmusic", id };
}

export function parseUrl(url) {
  const parsed = parse(url);
  const query = querystring.parse(parsed.query);
  let id = query.v;
  let list_id = query.list;
  let match;

  if (parsed.path.match(/^\/watch/) && id !== undefined) {
    return lookupId(id, "track");
  } else if ((match = parsed.path.match(/^\/browse\/([A-Za-z0-9_]+)/))) {
    return lookupId(match[1], "album");
  } else if (
    (match = parsed.path.match(/^\/playlist/) && list_id !== undefined)
  ) {
    return lookupId(list_id, "playlist");
  }
  throw new Error();
}
export const id = "ytmusic";
export const match = urlMatch;
