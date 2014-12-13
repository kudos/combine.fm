"use strict";
var assert = require("assert");
var should = require('should');

var google = require("../../lib/services/google");

describe('Google Play Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function(done){
      google.lookupId("Byp6lvzimyf74wxi5634ul4tgam", "album").then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });

    it('should find track by ID', function(done){
      google.lookupId("Tjosptub24g2dft37lforqnudpe", "track").then(function(result) {
        result.name.should.equal("Cherub Rock");
        done();
      });
    });
  });

  describe('search', function(){
    it('should find album by search', function(done){
      google.search({type: "album", artist: {name: "David Guetta"}, name: "Listen (Deluxe)"}).then(function(result) {
        result.name.should.equal("Listen (Deluxe)");
        done();
      });
    });
  });

  describe('lookupUrl', function(){
    it('should parse regular url into album ID', function(done){
      google.parseUrl("https://play.google.com/music/listen#/album/Byp6lvzimyf74wxi5634ul4tgam/David+Guetta/Listen+(Deluxe)").then(function(result) {
        result.id.should.equal("Byp6lvzimyf74wxi5634ul4tgam");
        done();
      });
    });

    it('should parse url without ID into album ID', function(done){
      google.parseUrl("https://play.google.com/music/listen#/album//David+Guetta/Listen+(Deluxe)").then(function(result) {
        result.id.should.equal("Byp6lvzimyf74wxi5634ul4tgam");
        done();
      });
    });

    it('should parse share url into album ID', function(done){
      google.parseUrl("https://play.google.com/music/m/Byp6lvzimyf74wxi5634ul4tgam").then(function(result) {
        result.id.should.equal("Byp6lvzimyf74wxi5634ul4tgam");
        done();
      });
    });
  });
});
