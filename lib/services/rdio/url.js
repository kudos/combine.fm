import { parse } from 'url';

export function* match(url) {
  const parsed = parse(url);
  if (!parsed.host.match(/rd\.io$/) && !parsed.host.match(/rdio\.com$/)) {
    return false;
  }
  const regular = parsed.path.match(/[\/]*artist[\/]*([^\/]*)[\/]*album[\/]*([^\/]*)[\/]*([track]*)?[\/]*([^\/]*)/);
  const short = parsed.path.match(/[\/]*x[\/]*([^\/]*)/);
  return (regular && !!regular[2]) || (short && !!short[1]);
};
