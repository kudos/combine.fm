import 'should';
import * as itunes from '../../lib/services/itunes';

describe('iTunes Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function* (){
      const result = yield itunes.lookupId('id215206912', 'album');
      result.name.should.equal('Peace Orchestra');
    });

    it('should find track by ID', function* (){
      const result = yield itunes.lookupId('id215206958', 'track');
      result.name.should.equal('Double Drums');
    });
  });

  describe('search', function(){
    it('should find album by search', function* (){
      const result = yield itunes.search({type: 'album', artist: {name: 'Deftones'}, name: 'White Pony'});
      result.name.should.equal('White Pony');
    });

    it('should find awkward album by search', function* (){
      const result = yield itunes.search({type: 'album', artist: {name: 'Anavitória'}, name: 'Fica'});
      result.name.should.equal('Fica (feat. Matheus & Kauan) - Single');
    });

    it('should find track by search', function* (){
      const result = yield itunes.search({type: 'track', artist: {name: 'Deftones'}, albumName: 'Deftones', name: 'Hexagram'});
      result.name.should.equal('Hexagram');
    });
  });

  describe('lookupUrl', function(){
    describe('parseUrl', function(){
      it('should parse album url into ID', function* (){
        const result = yield itunes.parseUrl('https://itunes.apple.com/us/album/double-drums/id215206912');
        result.id.should.equal('us215206912');
      });

      it('should parse track url into ID', function* (){
        const result = yield itunes.parseUrl('https://itunes.apple.com/us/album/double-drums/id215206912?i=215206958&uo=4');
        result.id.should.equal('us215206958');
      });
    });
  });
});
