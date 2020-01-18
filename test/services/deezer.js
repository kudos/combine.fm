import 'should';
import * as deezer from '../../lib/services/deezer/index.js';

describe('Deezer', () => {
  describe('lookupId', () => {
    it('should find album by ID', async function test() {
      const result = await deezer.lookupId('302127', 'album');
      result.name.should.equal('Discovery');
    });

    it('should find track by ID', async function (){
      const result = await deezer.lookupId('3135554', 'track');
      result.name.should.equal('Aerodynamic');
    });
  });

  describe('search', () => {
    it('should find album by search', async function (){
      const result = await deezer.search({type: 'album', artist: {name: 'Jamie xx'}, name: 'In Colour'});
      result.name.should.startWith('In Colour');
    });

    it('should find album with various artists by search', async function (){
      const result = await deezer.search({type: 'album', artist: {name: 'Various Artists'}, name: 'The Trevor Nelson Collection'});
      result.name.should.equal('The Trevor Nelson Collection');
    });

    it('should find track by search', async function (){
      const result = await deezer.search({type: 'track', artist: {name: 'Deftones'}, albumName: 'Deftones', name: 'Hexagram'});
      result.name.should.equal('Hexagram');
    });
  });

  describe('lookupUrl', () => {
    describe('parseUrl', () => {
      it('should parse album url into ID', async function (){
        const result = await deezer.parseUrl('http://www.deezer.com/album/302127');
        result.id.should.equal(302127);
      });

      it('should parse track url into ID', async function (){
        const result = await deezer.parseUrl('http://www.deezer.com/track/3135554');
        result.id.should.equal(3135554);
      });
    });
  });
});
