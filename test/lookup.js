import "should";
import lookup from "../lib/lookup.js";

describe("Search with url", function() {
  it("should find album by url", async function() {
    const result = await lookup(
      "https://open.spotify.com/album/5TbRo1rBrhgHSTB4i2wdZS"
    );
    result.name.should.equal("Atom Bomb");
  });
});
