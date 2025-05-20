import { parse } from "url";

export default function match(url) {
  const parsed = parse(url);

  if (
    !parsed.host.match(/itunes\.apple\.com$/) &&
    !parsed.host.match(/music\.apple\.com$/)
  ) {
    return false;
  }

  const matches = parsed.path.match(
    /[/]?([/]?[a-z]{2}?)?[/]+(song|album)[/]+([^/]+)[/]+([^?]+)/
  );

  return !!matches[4];
}
