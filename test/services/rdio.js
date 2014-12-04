"use strict";
var assert = require("assert");
var should = require('should');

var rdio = require("../../lib/services/rdio");

describe('Rdio', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      rdio.lookupId("Qj4NXr0").then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      rdio.search({type: "album", artist: {name: "David Guetta"}, name: "Listen (Deluxe)"}).then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('parseUrl', function(){
    it('should parse regular url into album object', function(done){
      rdio.parseUrl("https://www.rdio.com/artist/David_Guetta/album/Listen_(Deluxe)/").then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });

    it('should parse short url into album object', function(done){
      rdio.parseUrl("http://rd.io/x/Qj4NXr0/").then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });
});
