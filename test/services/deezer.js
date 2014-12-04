"use strict";
var assert = require("assert");
var should = require('should');

var deezer = require("../../lib/services/deezer");

describe('Deezer', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      deezer.lookupId("302127", "album").then(function(result) {
        result.name.should.equal("Discovery");
        done();
      });
    });

    it('should find track by ID', function(done){
      deezer.lookupId("3135554", "track").then(function(result) {
        result.name.should.equal("Aerodynamic");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      deezer.search({type: "album", artist: {name: "David Guetta"}, name: "Listen (Deluxe)"}).then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });

    it('should find track by search', function(done){
      deezer.search({type: "track", artist: {name: "Deftones"}, album: {name: "Deftones"}, name: "Hexagram"}).then(function(result) {
        result.name.should.equal("Hexagram");
        done();
      });
    });
  });

  describe('lookupUrl', function(){
    describe('parseUrl', function(){
      it('should parse album url into ID', function(done){
        deezer.parseUrl("http://www.deezer.com/album/302127").then(function(result) {
          result.id.should.equal(302127);
          done();
        });
      });

      it('should parse track url into ID', function(done){
        deezer.parseUrl("http://www.deezer.com/track/3135554").then(function(result) {
          result.id.should.equal(3135554);
          done();
        });
      });
    });
  });
});
