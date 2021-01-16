import { parse } from 'url';
import querystring from 'querystring';

export default function match(url) {
  const parsed = parse(url);
  if (parsed.host.match(/music\.youtube\.com$/)) {
    return true;
  }
  return false;
}
