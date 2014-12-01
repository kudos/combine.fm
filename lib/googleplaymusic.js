var parse = require("url").parse;
var PlayMusic = require('playmusic');
var pm = new PlayMusic();

if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
  throw new Error("You need to set GOOGLE_EMAIL and GOOGLE_PASSWORD environment variables");
}

// It's probably ok to not wait for this to finish
pm.init({email: process.env.GOOGLE_EMAIL, password: process.env.GOOGLE_PASSWORD}, function() {});

module.exports.lookupId = function(id, type, next) {
  pm.getAlbum(id, true, function(album) {
    next({
      id: album.albumId,
      name: album.name,
      url: "https://play.google.com/music/listen#/album/" + album.albumId,
      artwork: album.albumArtRef.replace("http:", ""),
      artist: {
        name: album.artist
      },
      type: "album"
    });
  });
}

module.exports.search = function(query, type, next) {
  pm.search(query, 5, function(data) { // max 5 results
    var result = data.entries.filter(function(result) {
      return result.album;
    }).sort(function(a, b) { // sort by match score
      return a.score < b.score;
    }).shift();

    module.exports.lookupId(result.album.albumId, "album", next);
  });
}

module.exports.parseUrl = function(url, next) {
  var parsed = parse(url.replace(/\+/g, "%20"));
  var path = parsed.path;
  var hash = parsed.hash;
  if (hash) {
    var parts = hash.split("/");
    var type = parts[1];
    var id = parts[2];
    var artist = decodeURIComponent(parts[3]);
    var album = decodeURIComponent(parts[4]);

    if (id.length > 0) {
      return next({id: id, type: type});
    } else {
      module.exports.search(artist + " " + album, "album", function(googleAlbum) {
        next(googleAlbum);
      });
    }
  } else if(path) {
    var matches = path.match(/\/music\/m\/([\w]+)/);
    return next({id:matches[1], type: "album"});
  }
}
