import { parse } from 'url';

export default function match(url) {
  const parsed = parse(url.replace(/\+/g, '%20'));
  if (!parsed.host.match(/play\.google\.com$/)) {
    return false;
  }

  const path = parsed.path;
  const hash = parsed.hash;

  if (hash) {
    const parts = hash.split('/');
    const id = parts[2];
    const artist = parts[3];

    if (id.length > 0) {
      return true;
    } else if (artist.length > 0) {
      return true;
    }
  } else if (path) {
    const matches = path.match(/\/music\/m\/([\w]+)/);
    if (matches[1]) {
      return true;
    }
  }
  return false;
}
