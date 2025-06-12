import "should";
import * as youtube from "../../lib/services/youtube/index.js";

describe("Youtube", function() {
  describe("lookup", function() {
    it("should find album by lookup", async function() {
      const result = await youtube.lookupId("6JnGBs88sL0");
      result.name.should.equal("Say It Right");
    });
  });

  describe("search", function() {
    it("should find album by search", async function() {
      const result = await youtube.search({
        type: "track",
        artist: { name: "Aesop Rock" },
        album: { name: "Skeconsthon" },
        name: "Zero Dark Thirty"
      });
      result.name.should.startWith("Aesop Rock - Zero Dark Thirty");
    });
  });
});
