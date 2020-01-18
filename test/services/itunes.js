import 'should';
import * as itunes from '../../lib/services/itunes/index.js';

describe('iTunes Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', async function (){
      const result = await itunes.lookupId('1445991287', 'album');
      result.name.should.equal('Peace Orchestra');
    });

    it('should find track by ID', async function (){
      const result = await itunes.lookupId('1445927701', 'track');
      result.name.should.equal('Double Drums');
    });
  });

  describe('search', function(){
    it('should find album by search', async function (){
      const result = await itunes.search({type: 'album', artist: {name: 'Deftones'}, name: 'White Pony'});
      result.name.should.equal('White Pony');
    });

    it('should find awkward album by search', async function (){
      const result = await itunes.search({type: 'album', artist: {name: 'Anavitória'}, name: 'Fica'});
      result.name.should.equal('Fica (feat. Matheus & Kauan) - Single');
    });

    it('should find track by search', async function (){
      const result = await itunes.search({type: 'track', artist: {name: 'Deftones'}, albumName: 'Deftones', name: 'Hexagram'});
      result.name.should.equal('Hexagram');
    });
  });

  describe('lookupUrl', function(){
    describe('parseUrl', function(){
      it('should parse album url into ID', async function (){
        const result = await itunes.parseUrl('https://itunes.apple.com/us/album/peace-orchestra/1445991287');
        result.id.should.equal('us1445991287');
      });

      it('should parse track url into ID', async function (){
        const result = await itunes.parseUrl('https://itunes.apple.com/us/album/double-drums-dj-dsl-mix/1445927689?i=1445927701');
        result.id.should.equal('us1445927689');
      });
    });
  });
});
