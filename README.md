#match.audio [![Circle CI](https://circleci.com/gh/kudos/match.audio.svg?style=svg)](https://circleci.com/gh/kudos/match.audio)

Make sharing from music services better. We match links from Rdio, Spotify, Deezer, Google Music and iTunes and give you back a link with all of them.

## Supported Services

* Spotify
* iTunes
* Deezer
* Google Play Music (requires `GOOGLE_EMAIL` and `GOOGLE_PASSWORD`)
* Rdio (requires `RDIO_CLIENT_ID` and `RDIO_CLIENT_SECRET`)
* Xbox Music (requires `XBOX_CLIENT_ID` and `XBOX_CLIENT_SECRET`)
* Youtube (requires `YOUTUBE_KEY`)

Google doesn't provide a public API for Play Music, hence this `GOOGLE_PASSWORD` awfulness. The account also needs to be a Google Play Music All Access subscriber and to have played at least one track on a mobile device. Yeah.

It doesn't parse Youtube urls yet, only finds matches on Youtube. The metadata we get from Youtube around music videos is poor and will require more work than the others.

Support for Amazon Music is [in a branch](https://github.com/kudos/match.audio/tree/amazon) but the library I used is poor and needs either rewriting or replacing to support Amazon urls and not just finding matches on Amazon.

If you don't provide credentials, it will simply disable support for that service. Spotify, Deezer and iTunes don't need any auth. The test suite will fail if you don't provide credentials for all services, but individual tests will pass otherwise.

## Getting Started

Install `node` and `mongodb` if you don't already have them. Then `npm install` and run the app with `npm start` or tests with `npm test`.


## Contributing

Bug reports and feature requests welcome. If you want to contribute code, that is awesome but please issue pull requests early for discussion.

So there's no surprises for contributors later, I plan on using referral tags wherever it makes sense. Right now that would apply to outgoing links for Amazon, iTunes, Rdio and Spotify. The referral tags themselves will not be baked into the code, just support for using them.

## Licence

The code is MIT licenced, the brand is not. This applies to the logo, name and magenta colour scheme. I'll probably pull the branding out of the app itself at some point to make that distinction more clear.
