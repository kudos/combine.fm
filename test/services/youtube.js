"use strict";
var assert = require("assert");
var should = require('should');

var youtube = require("../../lib/services/youtube");

describe('Youtube', function(){
  describe('search', function(){
    it('should find album by search', function(done){
      youtube.search({type: "track", artist: {name: "Aesop Rock"}, album: {name: "Skelethon"}, name: "Zero Dark Thirty"}).then(function(result) {
        result.name.should.equal("Aesop Rock - Zero Dark Thirty");
        done();
      });
    });
  });
});
