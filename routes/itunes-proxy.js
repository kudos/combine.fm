import { parse } from 'url';
import request from 'superagent';

export default function* (next) {
  const url = `http://${this.request.url.substr(8)}`;
  const parsed = parse(url);
  if (parsed.host.match(/mzstatic\.com/)) {
    const proxyResponse = yield request.get(url);
    this.set(proxyResponse.headers);
    this.body = proxyResponse.body;
  } else {
    yield next;
  }
}
