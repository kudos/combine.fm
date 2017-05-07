import 'should';
import * as deezer from '../../lib/services/deezer';

describe('Deezer', function(){
  describe('lookupId', function(){
    it('should find album by ID', function* (){
      const result = yield deezer.lookupId('302127', 'album');
      result.name.should.equal('Discovery');
    });

    it('should find track by ID', function* (){
      const result = yield deezer.lookupId('3135554', 'track');
      result.name.should.equal('Aerodynamic');
    });
  });

  describe('search', function(){
    it('should find album by search', function* (){
      const result = yield deezer.search({type: 'album', artist: {name: 'Jamie xx'}, name: 'In Colour'});
      result.name.should.startWith('In Colour');
    });

    it('should find track by search', function* (){
      const result = yield deezer.search({type: 'track', artist: {name: 'Deftones'}, albumName: 'Deftones', name: 'Hexagram'});
      result.name.should.equal('Hexagram');
    });
  });

  describe('lookupUrl', function(){
    describe('parseUrl', function(){
      it('should parse album url into ID', function* (){
        const result = yield deezer.parseUrl('http://www.deezer.com/album/302127');
        result.id.should.equal(302127);
      });

      it('should parse track url into ID', function* (){
        const result = yield deezer.parseUrl('http://www.deezer.com/track/3135554');
        result.id.should.equal(3135554);
      });
    });
  });
});
