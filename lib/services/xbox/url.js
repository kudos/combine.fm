import { parse } from 'url';

export default function match(url) {
  const parsed = parse(url);
  if (!parsed.host.match(/music.microsoft.com$/)) {
    return false;
  }

  const parts = parsed.path.split('/');
  return (parts[1] === 'album' || parts[1] === 'track') && parts[4];
}
