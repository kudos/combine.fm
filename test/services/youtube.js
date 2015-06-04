import 'should';
import youtube from '../../lib/services/youtube';

describe('Youtube', function(){
  describe('search', function(){
    it('should find album by search', function* (){
      let result = yield youtube.search({type: 'track', artist: {name: 'Aesop Rock'}, album: {name: 'Skelethon'}, name: 'Zero Dark Thirty'});
      result.name.should.equal('Aesop Rock - Zero Dark Thirty');
    });
  });
});
