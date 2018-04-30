import 'should';
import * as google from '../../lib/services/google';

describe('Google Play Music', () => {
  describe('lookupId', () => {
    it('should find album by ID', async function (){
      const result = await google.lookupId('Byp6lvzimyf74wxi5634ul4tgam', 'album');
      result.name.should.equal('Listen');
    });

    it('should find track by ID', async function (){
      const result = await google.lookupId('Tjosptub24g2dft37lforqnudpe', 'track');
      result.name.should.equal('Cherub Rock');
    });
  });

  describe('search', () => {
    it('should find album by search', async function (){
      const result = await google.search({type: 'album', artist: {name: 'Jamie xx'}, name: 'In Colour'});
      result.name.should.equal('In Colour');
    });

    it('should find track by search', async function (){
      const result = await google.search({type: 'track', artist: {name: 'Jamie xx'}, albumName: 'In Colour', name: 'Loud Places'});
      result.name.should.equal('Loud Places');
    });

    it('should find awkward track by search', async function (){
      const result = await google.search({type: 'track', artist: {name: 'Jamie xx'}, albumName: 'Loud Places (Remixes)', name: 'Loud Places [Tessela Remix]'});
      result.name.should.equal('Loud Places [Tessela Remix]');
    });
  });

  describe('lookupUrl', () => {
    it('should parse regular url into album ID', async function (){
      const result = await google.parseUrl('https://play.google.com/music/listen#/album/Byp6lvzimyf74wxi5634ul4tgam/Jamie+xx/In+Colour');
      result.id.should.equal('Byp6lvzimyf74wxi5634ul4tgam');
    });

    it('should parse url without ID into album ID', async function (){
      const result = await google.parseUrl('https://play.google.com/music/listen#/album//Jamie+xx/In+Colour');
      result.id.should.equal('Bvfmezcj3n42lo4xeuslpclbyrm');
    });

    it('should parse share url into album ID', async function (){
      const result = await google.parseUrl('https://play.google.com/music/m/Byp6lvzimyf74wxi5634ul4tgam');
      result.id.should.equal('Byp6lvzimyf74wxi5634ul4tgam');
    });
  });
});
