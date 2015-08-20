import { parse } from 'url';
import querystring from 'querystring';

export function* match(url, type) {
  const parsed = parse(url);

  if (!parsed.host.match(/itunes.apple\.com$/)) {
    return false;
  }

  const matches = parsed.path.match(/[\/]?([\/]?[a-z]{2}?)?[\/]+album[\/]+([^\/]+)[\/]+([^\?]+)/);
  const query = querystring.parse(parsed.query);

  return !!matches[3];
};
