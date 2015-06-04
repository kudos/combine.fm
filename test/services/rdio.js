import 'should';
import rdio from '../../lib/services/rdio';

describe('Rdio', function(){
  describe('lookupId', function(){
    it('should find album by ID', function* (){
      let result = yield rdio.lookupId('Qj4NXr0');
      result.name.should.equal('Listen (Deluxe)');
    });
  });

  describe('search', function(){
    it('should find album by search', function* (){
      let result = yield rdio.search({type: 'album', artist: {name: 'David Guetta'}, name: 'Listen (Deluxe)'});
      result.name.should.equal('Listen (Deluxe)');
    });
  });

  describe('parseUrl', function(){
    it('should parse regular url into album object', function* (){
      let result = yield rdio.parseUrl('https://www.rdio.com/artist/David_Guetta/album/Listen_(Deluxe)/');
      result.name.should.equal('Listen (Deluxe)');
    });

    it('should parse short url into album object', function* (){
      let result = yield rdio.parseUrl('http://rd.io/x/Qj4NXr0/');
      result.name.should.equal('Listen (Deluxe)');
    });
  });
});
