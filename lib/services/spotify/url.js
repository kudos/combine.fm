import { parse } from 'url';

export function* match(url, type) {
  const parsed = parse(url);
  if (!parsed.host.match(/spotify\.com$/)) {
    return false;
  }

  const matches = parse(url).path.match(/\/(album|track)[\/]+([^\/]+)/);
  return matches && !!matches[2];
};
