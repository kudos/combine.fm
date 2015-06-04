import 'should';
import google from '../../lib/services/google';

describe('Google Play Music', function(){
  describe('lookupId', function(){
    it('should find album by ID', function* (){
      let result = yield google.lookupId('Byp6lvzimyf74wxi5634ul4tgam', 'album');
      result.name.should.equal('Listen (Deluxe)');
    });

    it('should find track by ID', function* (){
      let result = yield google.lookupId('Tjosptub24g2dft37lforqnudpe', 'track');
      result.name.should.equal('Cherub Rock');
    });
  });

  describe('search', function(){
    it('should find album by search', function* (){
      let result = yield google.search({type: 'album', artist: {name: 'David Guetta'}, name: 'Listen (Deluxe)'});
      result.name.should.equal('Listen (Deluxe)');
    });
  });

  describe('lookupUrl', function(){
    it('should parse regular url into album ID', function* (){
      let result = yield google.parseUrl('https://play.google.com/music/listen#/album/Byp6lvzimyf74wxi5634ul4tgam/David+Guetta/Listen+(Deluxe)');
      result.id.should.equal('Byp6lvzimyf74wxi5634ul4tgam');
    });

    it('should parse url without ID into album ID', function* (){
      let result = yield google.parseUrl('https://play.google.com/music/listen#/album//David+Guetta/Listen+(Deluxe)');
      result.id.should.equal('Byp6lvzimyf74wxi5634ul4tgam');
    });

    it('should parse share url into album ID', function* (){
      let result = yield google.parseUrl('https://play.google.com/music/m/Byp6lvzimyf74wxi5634ul4tgam');
      result.id.should.equal('Byp6lvzimyf74wxi5634ul4tgam');
    });
  });
});
