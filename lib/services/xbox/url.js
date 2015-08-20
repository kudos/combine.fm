import { parse } from 'url';

export function* match(url, type) {
  const parsed = parse(url);
  if (!parsed.host.match(/music.xbox.com$/)) {
    return false;
  }

  const parts = parsed.path.split("/");
  return (parts[1] == "album" || parts[1] == "track") && parts[4];
};
