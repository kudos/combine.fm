"use strict";
var assert = require("assert");
var should = require('should');

var itunes = require("../../lib/services/itunes");

describe('iTunes Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      itunes.lookupId("id215206912", "album").then(function(result) {
        result.name.should.equal("Peace Orchestra");
        done();
      });
    });

    it('should find track by ID', function(done){
      itunes.lookupId("id215206958", "track").then(function(result) {
        result.name.should.equal("Double Drums");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      itunes.search({type: "album", artist: {name: "Deftones"}, name: "Deftones"}).then(function(result) {
        result.name.should.equal("Deftones");
        done();
      });
    });

    it('should find track by search', function(done){
      itunes.search({type: "track", artist: {name: "Deftones"}, album: {name: "Deftones"}, name: "Hexagram"}).then(function(result) {
        result.name.should.equal("Hexagram");
        done();
      });
    });
  });

  describe('lookupUrl', function(){
    describe('parseUrl', function(){
      it('should parse album url into ID', function(done){
        itunes.parseUrl("https://itunes.apple.com/us/album/double-drums/id215206912").then(function(result) {
          result.id.should.equal("us215206912");
          done();
        });
      });

      it('should parse track url into ID', function(done){
        itunes.parseUrl("https://itunes.apple.com/us/album/double-drums/id215206912?i=215206958&uo=4").then(function(result) {
          result.id.should.equal("us215206958");
          done();
        });
      });
    });
  });
});
