import 'should';
import * as amazon from '../../lib/services/amazon';

describe('Amazon', function () {
  describe('lookupId', function () {
    it('should find album by ID', async function () {
      const result = await amazon.lookupId('B00V8I134A', 'album');
      result.name.should.equal('In Colour [Explicit]');
    });

    it('should find track by ID', async function () {
      const result = await amazon.lookupId('B00V8I1CKU', 'track');
      result.name.should.equal('Sleep Sound');
    });
  });

  describe('search', function(){
    it('should find album by search', async function () {
      const result = await amazon.search({type: 'album', artist: {name: 'Jamie xx'}, name: 'In Colour'});
      result.name.should.equal('In Colour [Explicit]');
    });

    it('should find track by search', async function () {
      const result = await amazon.search({type: 'track', artist: {name: 'Jamie xx'}, albumName: 'In Colour', name: 'Loud Places'});
      result.name.should.equal('Loud Places');
    });

    it('should find awkward track by search', async function () {
      const result = await amazon.search({type: 'track', artist: {name: 'Jamie xx'}, albumName: 'In Colour (Remixes)', name: 'Loud Places [Tessela Remix]'});
      result.name.should.equal('Loud Places [Tessela Remix]');
    });
  });
});

