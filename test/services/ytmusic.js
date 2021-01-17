import 'should';
import * as ytmusic from '../../lib/services/ytmusic/index.js';

describe('ytmusic', function(){
  describe('lookupId', () => {
    it('should find album by ID', async function testV() {
      const result = await ytmusic.lookupId('MPREb_nlOKEssnatr', 'album');
      result.name.should.equal('Carne de Pescoço');
    });

    it('should find track by ID', async function (){
      const result = await ytmusic.lookupId('9zrYXvUXiQk', 'track');
      result.name.should.equal('One Vision (Remastered 2011)');
    });
  });
  describe('search', () => {
    it('should find album by search', async function (){
      const result = await ytmusic.search({type: 'album', artist: {name: 'Jamie xx'}, name: 'In Colour'});
      result.name.should.startWith('In Colour');
      result.id.should.equal("MPREb_IbDz5pAZFvJ");
    });

    it('should find album with various artists by search', async function (){
      const result = await ytmusic.search({type: 'album', artist: {name: 'Various Artists'}, name: 'Sambabook João Nogueira'});
      result.name.should.equal('Sambabook João Nogueira');
      result.id.should.equal('MPREb_iZt1VjORlv7');
    });

    it('should find track by search', async function (){
      const result = await ytmusic.search({type: 'track', artist: {name: 'Oasis'}, albumName: 'Stop The Clocks', name: 'Wonderwall'});
      result.name.should.equal('Wonderwall');
      result.id.should.equal('Gvfgut8nAgw');
    });
  });
  describe('lookupUrl', () => {
    describe('parseUrl', () => {
      it('should parse track url into ID', async function (){
        const result = await ytmusic.parseUrl('https://music.youtube.com/watch?v=YLp2cW7ICCU&feature=share');
        result.id.should.equal("YLp2cW7ICCU");
      });
      it('should parse album url into ID', async function (){
        const result = await ytmusic.parseUrl('https://music.youtube.com/browse/MPREb_9C36yscfgmJ');
        result.id.should.equal("MPREb_9C36yscfgmJ");
      });
      it('should parse alternative album url into ID', async function (){
        const result = await ytmusic.parseUrl('https://music.youtube.com/playlist?list=OLAK5uy_lx9K5RpiBEwd3E4C1GKqY7e06qTlwydvs');
        result.id.should.equal("MPREb_9C36yscfgmJ");
      });
    });
  });
});
