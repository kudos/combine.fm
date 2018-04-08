import 'should';
import * as amazon from '../../lib/services/amazon';

describe('Amazon', function () {
  describe('lookupId', function () {
    it('should find album by ID', function* () {
      const result = yield amazon.lookupId('B00WMW3HFY', 'album');
      result.name.should.equal('In Colour [Explicit]');
    });

    it('should find track by ID', function* (){
      const result = yield amazon.lookupId('B00WMW3TUM', 'track');
      result.name.should.equal('Sleep Sound');
    });
  });

  describe('search', function(){
    it('should find album by search', function* () {
      const result = yield amazon.search({type: 'album', artist: {name: 'Jamie xx'}, name: 'In Colour'});
      result.name.should.equal('In Colour [Explicit]');
    });

    it('should find track by search', function* (){
      const result = yield amazon.search({type: 'track', artist: {name: 'Jamie xx'}, albumName: 'In Colour', name: 'Loud Places'});
      result.name.should.equal('Loud Places');
    });

    it('should find awkward track by search', function* (){
      const result = yield amazon.search({type: 'track', artist: {name: 'Jamie xx'}, albumName: 'In Colour (Remixes)', name: 'Loud Places [Tessela Remix]'});
      result.name.should.equal('Loud Places [Tessela Remix]');
    });
  });
});

