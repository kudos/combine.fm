import 'should';
import lookup from '../lib/lookup.js';

describe('Search with url', function(){
  it('should find album by url', async function (){
    const result = await lookup('https://play.google.com/music/m/Bw2bwajaddrgr5vakp3vluqothq');
    result.name.should.equal('Breaking');
  });
});
