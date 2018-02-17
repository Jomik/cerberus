import "mocha";
import { expect } from "chai";
import { boolean } from "../src";
import { InvalidResult, ValidResult } from "../src/types";
import { NumericProperty } from "../src/constraints/property";
// tslint:disable:no-unused-expression

describe("boolean", () => {
  describe("accepts", () => {
    it("true", () => {
      const spec = boolean;
      const { valid } = spec.validate(true);
      expect(valid).to.be.true;
    });
    it("false", () => {
      const spec = boolean;
      const { valid } = spec.validate(false);
      expect(valid).to.be.true;
    });
  });
  describe("rejects", () => {
    it("<undefined>", () => {
      const spec = boolean;
      const { valid: invalid, errors } = spec.validate(
        undefined
      ) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<string>", () => {
      const spec = boolean;
      const { valid: invalid, errors } = spec.validate("foo") as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<number>", () => {
      const spec = boolean;
      const { valid: invalid, errors } = spec.validate(42) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<object>", () => {
      const spec = boolean;
      const { valid: invalid, errors } = spec.validate({}) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<array>", () => {
      const spec = boolean;
      const { valid: invalid, errors } = spec.validate([]) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
  describe("has", () => {
    it("truthy", () => {
      const spec = boolean.truthy("foo");
      const { valid, obj } = spec.validate("foo") as ValidResult<boolean>;
      expect(valid).to.be.true;
      expect(obj).to.equal(true);
      const { valid: invalid } = spec.validate("bar");
      expect(invalid).to.be.false;
    });
    it("falsy", () => {
      const spec = boolean.falsy("foo");
      const { valid, obj } = spec.validate("foo") as ValidResult<boolean>;
      expect(valid).to.be.true;
      expect(obj).to.equal(false);
      const { valid: invalid } = spec.validate("bar");
      expect(invalid).to.be.false;
    });
  });
});
