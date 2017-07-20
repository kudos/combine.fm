import { parse } from 'url';

export default function match(url) {
  const parsed = parse(url);
  if (!parsed.host.match(/deezer\.com$/)) {
    return false;
  }
  const matches = parsed.path.match(/\/(album|track)[/]+([^/]+)/);
  return matches.length > 1;
}
