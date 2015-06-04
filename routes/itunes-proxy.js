import {parse} from 'url';
import request from 'superagent';

module.exports = function* (next) {
  let url = 'http://' + this.request.url.substr(8);
  let parsed = parse(url);
  if (parsed.host.match(/mzstatic\.com/)) {
    let proxyResponse = yield request.get(url);
    this.set(proxyResponse.headers);
    this.body = proxyResponse.body;
  } else {
    yield next;
  }
};
