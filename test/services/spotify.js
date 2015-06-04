import 'should';
import spotify from '../../lib/services/spotify';

describe('Spotify', function(){
  describe('lookupId', function(){
    it('should find album by ID', function* (){
      let result = yield spotify.lookupId('77UW17CZFyCaRLHdHeofZu', 'album');
      result.name.should.equal('Listen (Deluxe)');
    });

    it('should find track by ID', function* (){
      let result = yield spotify.lookupId('7dS5EaCoMnN7DzlpT6aRn2', 'track');
      result.name.should.equal('Take Me To Church');
    });
  });

  describe('search', function(){
    it('should find album by search', function* (){
      let result = yield spotify.search({type: 'album', artist: {name: 'David Guetta'}, name: 'Listen (Deluxe)'});
      result.name.should.equal('Listen (Deluxe)');
    });
  });

  describe('parseUrl', function(){
    it('should parse url into ID', function* (){
      let result = yield spotify.parseUrl('https://play.spotify.com/album/77UW17CZFyCaRLHdHeofZu');
      result.id.should.equal('77UW17CZFyCaRLHdHeofZu');
    });
  });
});
