import "mocha";
import { expect } from "chai";
import * as schema from "../src";
import { InvalidResult, ValidResult } from "../src/types";
// tslint:disable:no-unused-expression

describe("any", () => {
  describe("accepts", () => {
    it("anything not undefined", () => {
      const spec = schema.any;
      const { valid } = spec.validate("foo");
      expect(valid).to.be.true;
    });
    it("optional", () => {
      const spec = schema.any.optional();
      const { valid } = spec.validate(undefined);
      expect(valid).to.be.true;
    });
    it("default", () => {
      const spec = schema.any.default(5);
      const { valid, obj } = spec.validate(undefined) as ValidResult<number>;
      expect(valid).to.be.true;
      expect(obj).to.be.equal(5);
    });
  });
  describe("rejects", () => {
    it("on undefined", () => {
      const spec = schema.any;
      const { valid, errors } = spec.validate(undefined) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
  describe("oneOf", () => {
    describe("accepts", () => {
      it("<string>", () => {
        const spec = schema.any.oneOf("foo", "bar", "baz");
        const { valid: valid1 } = spec.validate("foo");
        expect(valid1).to.be.true;
        const { valid: valid2 } = spec.validate("bar");
        expect(valid2).to.be.true;
        const { valid: valid3 } = spec.validate("baz");
        expect(valid3).to.be.true;
      });
      it("<number>", () => {
        const spec = schema.any.oneOf(1, 2, 3);
        const { valid: valid1 } = spec.validate(1);
        expect(valid1).to.be.true;
        const { valid: valid2 } = spec.validate(2);
        expect(valid2).to.be.true;
        const { valid: valid3 } = spec.validate(3);
        expect(valid3).to.be.true;
        spec.validate(2);
      });
      it("any", () => {
        const spec = schema.any.oneOf("foo", 42, { a: "bar" });
        const { valid: valid1 } = spec.validate("foo");
        expect(valid1).to.be.true;
        const { valid: valid2 } = spec.validate(42);
        expect(valid2).to.be.true;
        const { valid: valid3 } = spec.validate({ a: "bar" });
        expect(valid3).to.be.true;
      });
    });
  });
});
