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
