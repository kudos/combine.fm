import request from 'superagent';
import 'superagent-bluebird-promise';

export function fetchItem(service, type, id) {
  return request.get(`/${service}/${type}/${id}.json`);
}

export function fetchRecents() {
  return request.get('/recent');
}

export function musicSearch(url) {
  return request.post('/search').send({ url });
}
