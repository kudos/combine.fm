import 'should';
import * as youtube from '../../lib/services/youtube';

describe('Youtube', function(){
  describe('search', function(){
    it('should find album by search', function* (){
      const result = yield youtube.search({type: 'track', artist: {name: 'Aesop Rock'}, album: {name: 'Skeconsthon'}, name: 'Zero Dark Thirty'});
      result.name.should.equal('Aesop Rock - Zero Dark Thirty');
    });
  });
});
