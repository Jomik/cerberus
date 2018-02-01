import "mocha";
import { expect } from "chai";
import { validate } from "../src";
import * as schema from "../src";
// tslint:disable:no-unused-expression

describe("number", () => {
  describe("accepts", () => {
    it("any string", () => {
      const spec = schema.number;
      const { valid } = spec.validate(42);
      expect(valid).to.be.true;
    });
  });
  describe("rejects", () => {});
});
