import { parse } from 'url';
import querystring from 'querystring';
import request from 'superagent';
import 'superagent-bluebird-promise';

const credentials = {
  key: process.env.YOUTUBE_KEY,
};

const apiRoot = "https://www.googleapis.com/freebase/v1/topic";

export function* get(topic) {
  const result = yield request.get(apiRoot + topic + "?key=" + credentials.key).promise();
  return result.body;
}
