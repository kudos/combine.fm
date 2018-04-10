import { parse } from 'url';

export default function match(url) {
  const parsed = parse(url);
  if (!parsed.host.match(/spotify\.com$/)) {
    return false;
  }

  const matches = parse(url).path.match(/\/(album|track)[/]+([A-Za-z0-9]+)/);
  return matches && !!matches[2];
}
