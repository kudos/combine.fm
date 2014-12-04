#match.audio [![Circle CI](https://circleci.com/gh/kudos/match.audio.svg?style=svg)](https://circleci.com/gh/kudos/match.audio)

Make sharing from music services better. We match links from Rdio, Spotify, Deezer, Beats Music, Google Music and iTunes and give you back a link with all of them.

Some of the services require keys/credentials be passed via environment variables:

Rdio: `RDIO_API_KEY` and `RDIO_API_SHARED`
Beats Music: `BEATS_KEY` and `BEATS_SECRET`
Google Play Music: `GOOGLE_EMAIL` and `GOOGLE_PASSWORD`

Google doesn't provide an API for Play Music, hence this `GOOGLE_PASSWORD` awfulness.

If you don't provide credentials, it will simply disable support for that service. Spotify, Deezer and iTunes don't need any auth.

To get started, first `npm install` and then run the app with `npm start` or tests with `npm test`.

This is in super early development and is incapable of handling getting dugg, never mind hacker news.

On the immediate todo list:

* Use album release year for additional sanity check on matches
* Maybe drop everything from the first special character in album names to improve matches **after** failing to get a good match
* Handle expected and unexpected errors better than the current crash-fest
* Add some kind of persistence or caching so it could take a pummeling and not get me banned from the various services
