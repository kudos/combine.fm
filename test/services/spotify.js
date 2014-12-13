"use strict";
var assert = require("assert");
var should = require('should');

var spotify = require("../../lib/services/spotify");

describe('Spotify', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      spotify.lookupId("77UW17CZFyCaRLHdHeofZu", "album").then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });

    it('should find track by ID', function(done){
      spotify.lookupId("7dS5EaCoMnN7DzlpT6aRn2", "track").then(function(result) {
        result.name.should.equal("Take Me To Church");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      spotify.search({type: "album", artist: {name: "David Guetta"}, name: "Listen (Deluxe)"}).then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('parseUrl', function(){
    it('should parse url into ID', function(done){
      spotify.parseUrl("https://play.spotify.com/album/77UW17CZFyCaRLHdHeofZu").then(function(result) {
        result.id.should.equal("77UW17CZFyCaRLHdHeofZu");
        done();
      });
    });
  });
});
