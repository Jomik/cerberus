import "mocha";
import { expect } from "chai";
import { validate } from "../src";
import * as schema from "../src";
import { InvalidResult, ValidResult } from "../src/types";
// tslint:disable:no-unused-expression

describe("any", () => {
  describe("accepts", () => {
    it("anything not undefined", () => {
      const spec = schema.any;
      const { valid } = validate(spec, "foo");
      expect(valid).to.be.true;
    });
    it("optional", () => {
      const spec = schema.any.optional;
      const { valid } = validate(spec, undefined);
      expect(valid).to.be.true;
    });
    it("default", () => {
      const spec = schema.any.default(5);
      const { valid, obj } = validate(spec, undefined) as ValidResult<number>;
      expect(valid).to.be.true;
      expect(obj).to.be.equal(5);
    });
  });
  describe("rejects", () => {
    it("on undefined", () => {
      const spec = schema.any;
      const { valid, errors } = validate(spec, undefined) as InvalidResult;
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
        const { valid: valid1 } = validate(spec, "foo");
        expect(valid1).to.be.true;
        const { valid: valid2 } = validate(spec, "bar");
        expect(valid2).to.be.true;
        const { valid: valid3 } = validate(spec, "baz");
        expect(valid3).to.be.true;
      });
      it("<number>", () => {
        const spec = schema.any.oneOf(1, 2, 3);
        const { valid: valid1 } = validate(spec, 1);
        expect(valid1).to.be.true;
        const { valid: valid2 } = validate(spec, 2);
        expect(valid2).to.be.true;
        const { valid: valid3 } = validate(spec, 3);
        expect(valid3).to.be.true;
      });
      it("any", () => {
        const spec = schema.any.oneOf("foo", 42, { a: "bar" });
        const { valid: valid1 } = validate(spec, "foo");
        expect(valid1).to.be.true;
        const { valid: valid2 } = validate(spec, 42);
        expect(valid2).to.be.true;
        const { valid: valid3 } = validate(spec, { a: "bar" });
        expect(valid3).to.be.true;
      });
    });
  });
});
