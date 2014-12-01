var assert = require("assert");
var should = require('should');
var spotify = require("../lib/spotify");

describe('Spotify', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      spotify.lookupId("77UW17CZFyCaRLHdHeofZu", "album", function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      spotify.search("David Guetta Listen (Deluxe)", "album", function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('parseUrl', function(){
    it('should parse url into ID', function(done){
      spotify.parseUrl("https://play.spotify.com/album/77UW17CZFyCaRLHdHeofZu", function(result) {
        result.id.should.equal("77UW17CZFyCaRLHdHeofZu");
        done();
      });
    });
  });
});
