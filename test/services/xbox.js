"use strict";
var assert = require("assert");
var should = require('should');

var google = require("../../lib/services/xbox");

describe('Xbox Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      google.lookupId("music.8b558d00-0100-11db-89ca-0019b92a3933", "album").then(function(result) {
        result.name.should.equal("Muchas Gracias: The Best Of Kyuss");
        done();
      });
    });

    it('should find track by ID', function(done){
      google.lookupId("music.8f558d00-0100-11db-89ca-0019b92a3933", "track").then(function(result) {
        result.name.should.equal("Shine");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      google.search({type: "album", artist: {name: "Kyuss"}, name: "Muchas Gracias: The Best Of Kyuss"}).then(function(result) {
        result.name.should.equal("Muchas Gracias: The Best Of Kyuss");
        done();
      });
    });
  });

  describe('lookupUrl', function(){
    it('should parse regular url into album ID', function(done){
      google.parseUrl("https://music.xbox.com/album/kyuss/muchas-gracias-the-best-of-kyuss/8b558d00-0100-11db-89ca-0019b92a3933").then(function(result) {
        result.id.should.equal("music.8B558D00-0100-11DB-89CA-0019B92A3933");
        done();
      });
    });
  });
});
