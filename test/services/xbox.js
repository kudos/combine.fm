import 'should';
import * as xbox from '../../lib/services/xbox';

describe('Xbox Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function* (){
      const result = yield xbox.lookupId('music.8b558d00-0100-11db-89ca-0019b92a3933', 'album');
      result.name.should.equal('Muchas Gracias: The Best Of Kyuss');
    });

    it('should find track by ID', function* (){
      const result = yield xbox.lookupId('music.8f558d00-0100-11db-89ca-0019b92a3933', 'track');
      result.name.should.equal('Shine');
    });
  });

  describe('search', function(){
    it('should find album by search', function* (){
      const result = yield xbox.search({type: 'album', artist: {name: 'Kyuss'}, name: 'Muchas Gracias: The Best Of Kyuss'});
      result.name.should.equal('Muchas Gracias: The Best Of Kyuss');
    });

    it('should find awkward album by search', function* (){
      const result = yield xbox.search({type: 'album', artist: {name: 'Anavitória'}, name: 'Fica'});
      result.name.should.equal('Fica');
      result.artist.name.should.equal('Anavitória');
    });
  });

  describe('lookupUrl', function(){
    it('should parse regular url into album ID', function* (){
      const result = yield xbox.parseUrl('https://music.xbox.com/album/kyuss/muchas-gracias-the-best-of-kyuss/8b558d00-0100-11db-89ca-0019b92a3933');
      result.id.should.equal('music.8D6KGX5BZ8WB');
    });
  });
});
