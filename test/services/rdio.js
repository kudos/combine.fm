import 'should';
import * as rdio from '../../lib/services/rdio';

describe('Rdio', function(){
  describe('lookupId', function(){
    it('should find album by ID', function* (){
      const result = yield rdio.lookupId('Qj4NXr0');
      result.name.should.equal('Listen (Deluxe)');
    });
  });

  describe('search', function(){
    it('should find album by search', function* (){
      const result = yield rdio.search({type: 'album', artist: {name: 'David Guetta'}, name: 'Listen (Deluxe)'});
      result.name.should.equal('Listen (Deluxe)');
    });
  });

  describe('parseUrl', function(){
    it('should parse regular url into album object', function* (){
      const result = yield rdio.parseUrl('https://www.rdio.com/artist/David_Guetta/album/Listen_(Deluxe)/');
      result.name.should.equal('Listen (Deluxe)');
    });

    it('should parse short url into album object', function* (){
      const result = yield rdio.parseUrl('http://rd.io/x/Qj4NXr0/');
      result.name.should.equal('Listen (Deluxe)');
    });
  });
});
