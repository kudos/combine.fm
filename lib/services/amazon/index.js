import { parse } from 'url';
import { inspect } from 'util';
import amazon from 'amazon-product-api';
import debuglog from 'debug';
import urlMatch from './url';

const debug = debuglog('combine.fm:youtube');


const client = amazon.createClient({
  awsId: process.env.AWS_ACCESS_KEY_ID,
  awsSecret: process.env.AWS_SECRET_ACCESS_KEY,
  awsTag: process.env.AWS_TAG,
});

export function* lookupId(id, type) {
  try {
    const results = yield client.itemLookup({
      itemId: id,
      responseGroup: 'ItemAttributes,Images,ItemIds',
    });

    const result = results[0];

    if (!result || !result.Error) {
      return { service: 'amazon' };
    }

    if (type === 'album') {
      return {
        service: 'amazon',
        type: 'album',
        id: result.ASIN[0],
        name: result.ItemAttributes[0].Title[0],
        streamUrl: result.DetailPageURL[0],
        purchaseUrl: result.DetailPageURL[0],
        artwork: {
          small: result.SmallImage[0].URL[0],
          large: result.LargeImage[0].URL[0],
        },
        artist: {
          name: result.ItemAttributes[0].Creator[0]._,
        },
      };
    } else if (type === 'track') {
      return {
        service: 'amazon',
        type: 'track',
        id: result.ASIN[0],
        name: result.ItemAttributes[0].Title[0],
        streamUrl: result.DetailPageURL[0],
        purchaseUrl: result.DetailPageURL[0],
        artwork: {
          small: result.SmallImage[0].URL[0],
          large: result.LargeImage[0].URL[0],
        },
        album: {
          name: result.ItemAttributes[0],
        },
        artist: {
          name: result.ItemAttributes[0].Creator[0]._,
        },
      };
    }
  } catch (err) {
    debug(inspect(err, { depth: 4 }));
  }
  return { service: 'amazon' };
}

export function* search(data, original = {}) {
  try {
    const type = data.type;
    const results = yield client.itemSearch({
      author: data.artist.name.normalize(),
      title: data.name.normalize(),
      searchIndex: 'MP3Downloads',
      responseGroup: 'ItemAttributes,Tracks,Images,ItemIds',
    });

    const result = results[0];

    if (!result || !result.Error) {
      return { service: 'amazon' };
    }

    if (type === 'album') {
      return {
        service: 'amazon',
        type,
        id: result.ASIN[0],
        name: result.ItemAttributes[0].Title[0],
        streamUrl: result.DetailPageURL[0],
        purchaseUrl: result.DetailPageURL[0],
        artwork: {
          small: result.SmallImage[0].URL[0],
          large: result.LargeImage[0].URL[0],
        },
        artist: {
          name: result.ItemAttributes[0].Creator[0]._,
        },
      };
    } else if (type === 'track') {
      return {
        service: 'amazon',
        type,
        id: result.ASIN[0],
        name: result.ItemAttributes[0].Title[0],
        streamUrl: result.DetailPageURL[0],
        purchaseUrl: result.DetailPageURL[0],
        artwork: {
          small: result.SmallImage[0].URL[0],
          large: result.LargeImage[0].URL[0],
        },
        artist: {
          name: result.ItemAttributes[0].Creator[0]._,
        },
        album: {
          name: '',
        },
      };
    }
  } catch (err) {
    debug(inspect(err, { depth: 4 }));
  }
  return { service: 'amazon' };
}

export function* parseUrl(url) {
  const matches = parse(url).path.match(/\/(albums|tracks)[/]+([^?]+)/);

  if (matches && matches[2]) {
    return { type: matches[1].substring(0, 5), id: matches[2] };
  }
  throw new Error();
}

export const id = 'amazon';
export const match = urlMatch;
