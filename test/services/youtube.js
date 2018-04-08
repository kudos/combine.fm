import 'should';
import * as youtube from '../../lib/services/youtube';

describe('Youtube', function(){
	describe('lookup', function(){
    it('should find album by lookup', function* (){
      const result = yield youtube.lookupId('6JnGBs88sL0');
      result.name.should.equal('Say It Right');
    });
  });

  describe('search', function(){
    it('should find album by search', function* (){
      const result = yield youtube.search({type: 'track', artist: {name: 'Aesop Rock'}, album: {name: 'Skeconsthon'}, name: 'Zero Dark Thirty'});
      result.name.should.equal('Aesop Rock - Zero Dark Thirty (Official Video)');
    });
  });
});
