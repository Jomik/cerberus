import "mocha";
import { expect } from "chai";
import { oneOf } from "../src";
import { InvalidResult } from "../src/types";
// tslint:disable:no-unused-expression

describe("oneOf", () => {
  describe("accepts", () => {
    it("<string>", () => {
      const spec = oneOf("foo", "bar", "baz");
      const { valid: valid1 } = spec.validate("foo");
      expect(valid1).to.be.true;
      const { valid: valid2 } = spec.validate("bar");
      expect(valid2).to.be.true;
      const { valid: valid3 } = spec.validate("baz");
      expect(valid3).to.be.true;
    });
    it("<number>", () => {
      const spec = oneOf(1, 2, 3);
      const { valid: valid1 } = spec.validate(1);
      expect(valid1).to.be.true;
      const { valid: valid2 } = spec.validate(2);
      expect(valid2).to.be.true;
      const { valid: valid3 } = spec.validate(3);
      expect(valid3).to.be.true;
      spec.validate(2);
    });
    it("<any>", () => {
      const spec = oneOf("foo", 42, { a: "bar" });
      const { valid: valid1 } = spec.validate("foo");
      expect(valid1).to.be.true;
      const { valid: valid2 } = spec.validate(42);
      expect(valid2).to.be.true;
      const { valid: valid3 } = spec.validate({ a: "bar" });
      expect(valid3).to.be.true;
    });
  });
  describe("rejects", () => {
    it("wrong with one option", () => {
      const spec = oneOf("foo");
      const { valid, errors } = spec.validate("bar") as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("wrong with multiple options", () => {
      const spec = oneOf("foo", "bar", "baz");
      const { valid, errors } = spec.validate("buz") as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
});
