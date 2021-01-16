import 'should';
import * as ytmusic from '../../lib/services/ytmusic/index.js';

describe('ytmusic', function(){
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
