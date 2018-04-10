import "mocha";
import { expect } from "chai";
import { array, string } from "../src";

describe("array", () => {
  describe("accepts", () => {
    it("arrays", () => {
      const schema = array(string);
      const { result } = schema.validate([42, "bar", 42]);
      if (result.valid) {
        console.log(result.object);
      } else {
        console.log(result.error.details());
      }
    });
  });
});
