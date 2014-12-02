#Unify.audio [![Circle CI](https://circleci.com/gh/kudos/unify.audio.svg?style=svg)](https://circleci.com/gh/kudos/unify.audio)

Make sharing music from subscription services better. Give us one link (Rdio, Spotify or Google Music) and we'll match it with other services and give you back a link with all of them.

You'll need to have Rdio API keys (`RDIO_API_KEY` and `RDIO_API_SHARED`) and Google credentials (`GOOGLE_EMAIL` and `GOOGLE_PASSWORD`) and provide them via environment variables. Google doesn't provide an API for Play Music, hence this terrible hackery.

To get started, first `npm install` and then run the app with `npm start` or tests with `npm test`.

This is in super early development, has no design and only supports albums right now.

On the immediate todo list:

* Add support for tracks, and maybe artists
* Use album release year for additional sanity check on matches
* Do some kind of a design, particularly for the share page
