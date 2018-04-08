import { parse } from 'url';

export default function match(url) {
  const parsed = parse(url);
  if (!parsed.host.match(/\.amazon\.com$/)) {
    return false;
  }

  const matches = parse(url).path.match(/\/(albums)[/]+([^/]+)/);
  return (matches && !!matches[2]);
}
