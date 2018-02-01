import "mocha";
import { expect } from "chai";
import * as schema from "../src";
// tslint:disable:no-unused-expression

describe("string", () => {
  describe("accepts", () => {
    it("any string", () => {
      const spec = schema.string;
      const { valid } = spec.validate("foo");
      expect(valid).to.be.true;
    });
  });
  describe("rejects", () => {});
});
