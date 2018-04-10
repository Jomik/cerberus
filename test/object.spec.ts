import "mocha";
import { expect } from "chai";
import { object, number, string, any } from "../src";

describe("object", () => {
  describe("accepts", () => {
    it("objects", () => {
      const schema = object({ a: string });
    });
  });
});
