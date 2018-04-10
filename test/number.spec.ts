import "mocha";
import { expect } from "chai";
import { number } from "../src";

describe("number", () => {
  describe("accepts", () => {
    it("numbers", () => {
      const { result } = number.validate(42);
    });
  });
});
