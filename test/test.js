"use strict";
var assert = require("assert");
var should = require('should');
var spotify = require("../lib/spotify");
var rdio = require("../lib/rdio");
var googleplaymusic = require("../lib/googleplaymusic");
var beats = require("../lib/beats");

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
      spotify.search({type: "album", artist: {name: "David Guetta"}, name: "Listen (Deluxe)"}, function(result) {
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

describe('Rdio', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      rdio.lookupId("Qj4NXr0", function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      rdio.search({type: "album", artist: {name: "David Guetta"}, name: "Listen (Deluxe)"}, function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('lookupUrl', function(){
    it('should parse regular url into album object', function(done){
      rdio.lookupUrl("https://www.rdio.com/artist/David_Guetta/album/Listen_(Deluxe)/", function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });

    it('should parse short url into album object', function(done){
      rdio.lookupUrl("http://rd.io/x/Qj4NXr0/", function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });
});

describe('Google Play Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      googleplaymusic.lookupId("Byp6lvzimyf74wxi5634ul4tgam", "album", function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      googleplaymusic.search({type: "album", artist: {name: "David Guetta"}, name: "Listen (Deluxe)"}, function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('lookupUrl', function(){
    it('should parse regular url into album ID', function(done){
      googleplaymusic.parseUrl("https://play.google.com/music/listen#/album/Byp6lvzimyf74wxi5634ul4tgam/David+Guetta/Listen+(Deluxe)", function(result) {
        result.id.should.equal("Byp6lvzimyf74wxi5634ul4tgam");
        done();
      });
    });

    it('should parse url without ID into album ID', function(done){
      googleplaymusic.parseUrl("https://play.google.com/music/listen#/album//David+Guetta/Listen+(Deluxe)", function(result) {
        result.id.should.equal("Byp6lvzimyf74wxi5634ul4tgam");
        done();
      });
    });

    it('should parse share url into album ID', function(done){
      googleplaymusic.parseUrl("https://play.google.com/music/m/Byp6lvzimyf74wxi5634ul4tgam", function(result) {
        result.id.should.equal("Byp6lvzimyf74wxi5634ul4tgam");
        done();
      });
    });
  });
});

describe('Beats Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      beats.lookupId("al920431", function(result) {
        result.name.should.equal("Deftones");
        done();
      });
    });

    it('should find track by ID', function(done){
      beats.lookupId("tr6910289", function(result) {
        result.name.should.equal("Californication");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      beats.search({type: "album", artist: {name: "Deftones"}, name: "Deftones"}, function(result) {
        result.name.should.equal("Deftones");
        done();
      });
    });

    it('should find track by search', function(done){
      beats.search({type: "track", artist: {name: "Deftones"}, album: {name: "Deftones"}, name: "Hexagram"}, function(result) {
        result.name.should.equal("Hexagram");
        done();
      });
    });
  });

  describe('lookupUrl', function(){
    describe('parseUrl', function(){
      it('should parse album url into ID', function(done){
        beats.parseUrl("https://listen.beatsmusic.com/albums/al920431", function(result) {
          result.id.should.equal("al920431");
          done();
        });
      });

      it('should parse track url into ID', function(done){
        beats.parseUrl("https://listen.beatsmusic.com/albums/al6910269/tracks/tr6910289", function(result) {
          result.id.should.equal("tr6910289");
          done();
        });
      });
    });
  });
});
