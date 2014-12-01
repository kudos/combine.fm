var parse = require('url').parse;
var spotify = require('spotify');

module.exports.lookupId = function(id, type, next) {
  spotify.lookup({id: id, type: type}, function(err, data) {
    if ( err ) {
      console.log('Error occurred: ' + err);
      return;
    }

    var artist = data.artists[0];

    next({
      id: data.id,
      name: data.name,
      url: "https://play.spotify.com/album/" + data.id,
      artwork: data.images[0].url.replace("http:", ""),
      artist: {
        name: artist.name
      }
    })
  });
}

module.exports.search = function(query, type, next) {
  spotify.search({query: query, type: type}, function(err, data) {
    if ( err ) {
      console.log('Error occurred: ' + err);
      return;
    }

    album = data.albums.items[0];

    module.exports.lookupId(album.id, "album", next);
  });
}

module.exports.parseUrl = function(url, next) {
  var matches = parse(url).path.match(/\/album[\/]+([^\/]+)/);

  if (matches && matches[1]) {
    return next({id:matches[1], type: "album"})
  }
}
