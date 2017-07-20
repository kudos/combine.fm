import { parse } from 'url';

export default function match(url) {
  const parsed = parse(url);

  if (!parsed.host.match(/itunes.apple\.com$/)) {
    return false;
  }

  const matches = parsed.path.match(/[/]?([/]?[a-z]{2}?)?[/]+album[/]+([^/]+)[/]+([^?]+)/);

  return !!matches[3];
}
