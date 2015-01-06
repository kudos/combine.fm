"use strict";
require('should');

var search = require("../lib/search");

describe('Search with url', function(){
  
  it('should find album by url', function(done){
    search("https://play.google.com/music/listen#/album/Bz6wrjczddcj5hurijsv6ohdoay").then(function(result) {
      result.name.should.equal("Phase 5");
      done();
    });
  });
  
});