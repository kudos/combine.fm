"use strict";
require('should');

var lookup = require("../lib/lookup");

describe('Search with url', function(){
  
  it('should find album by url', function(done){
    lookup("https://play.google.com/music/listen#/album/Bz6wrjczddcj5hurijsv6ohdoay").then(function(result) {
      result.name.should.equal("Phase 5");
      done();
    });
  });
  
});