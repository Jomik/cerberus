import "mocha";
import { expect } from "chai";
import { number } from "../src";
import { test } from "./utils";
// tslint:disable:no-unused-expression

describe("number", () => {
  describe("accepts", () => {
    it("any number", () => {
      const spec = number;
      const { valid } = spec.validate(42);
      expect(valid).to.be.true;
    });
  });
  describe("rejects", () => {});
  describe("has", () => {
    it("gt", () => {
      test(number.gt(5), [6], [3]);
    });
    it("ge", () => {
      test(number.ge(3), [3, 6], [1]);
    });
    it("eq", () => {
      test(number.eq(3), [3], [1, 6]);
    });
    it("le", () => {
      test(number.le(3), [1, 3], [6]);
    });
    it("lt", () => {
      test(number.lt(6), [3], [6]);
    });
  });
});
