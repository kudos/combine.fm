"use strict";
var assert = require("assert");
var should = require('should');

var beats = require("../../lib/services/beats");

describe('Beats Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      beats.lookupId("al920431").then(function(result) {
        result.name.should.equal("Deftones");
        done();
      });
    });

    it('should find track by ID', function(done){
      beats.lookupId("tr6910289").then(function(result) {
        result.name.should.equal("Californication");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      beats.search({type: "album", artist: {name: "Deftones"}, name: "Deftones"}).then(function(result) {
        result.name.should.equal("Deftones");
        done();
      });
    });

    it('should find track by search', function(done){
      beats.search({type: "track", artist: {name: "Deftones"}, album: {name: "Deftones"}, name: "Hexagram"}).then(function(result) {
        result.name.should.equal("Hexagram");
        done();
      });
    });
  });

  describe('lookupUrl', function(){
    describe('parseUrl', function(){
      it('should parse album url into ID', function(done){
        beats.parseUrl("https://listen.beatsmusic.com/albums/al920431").then(function(result) {
          result.id.should.equal("al920431");
          done();
        });
      });

      it('should parse track url into ID', function(done){
        beats.parseUrl("https://listen.beatsmusic.com/albums/al6910269/tracks/tr6910289").then(function(result) {
          result.id.should.equal("tr6910289");
          done();
        });
      });
    });
  });
});
