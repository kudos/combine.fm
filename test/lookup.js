import 'should';
import lookup from '../lib/lookup';

describe('Search with url', function(){
  it('should find album by url', function* (){
    let result = yield lookup('https://play.google.com/music/listen#/album/Bz6wrjczddcj5hurijsv6ohdoay');
    result.name.should.equal('Phase 5');
  });
});
