import { parse } from 'url';

export function match(url) {
  var parsed = parse(url);
  if (!parsed.host.match(/rd\.io$/) && !parsed.host.match(/rdio\.com$/)) {
    return false;
  }
  var regular = parsed.path.match(/[\/]*artist[\/]*([^\/]*)[\/]*album[\/]*([^\/]*)[\/]*([track]*)?[\/]*([^\/]*)/);
  var short = parsed.path.match(/[\/]*x[\/]*([^\/]*)/);
  return (regular && !!regular[2]) || (short && !!short[1]);
};
