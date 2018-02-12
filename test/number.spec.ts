import "mocha";
import { expect } from "chai";
import { number } from "../src";
import { InvalidResult, ValidResult } from "../src/types";
// tslint:disable:no-unused-expression

describe("number", () => {
  describe("accepts", () => {
    it("any number", () => {
      const spec = number;
      const { valid } = spec.validate(42);
      expect(valid).to.be.true;
    });
    it("number in string", () => {
      const spec = number;
      const { valid, obj } = spec.validate("42") as ValidResult<number>;
      expect(valid).to.be.true;
      expect(obj).to.equal(42);
    });
    it("number prefixed in string", () => {
      const spec = number;
      const { valid, obj } = spec.validate("42foo") as ValidResult<number>;
      expect(valid).to.be.true;
      expect(obj).to.equal(42);
    });
  });
  describe("rejects", () => {
    it("<undefined>", () => {
      const spec = number;
      const { valid: invalid, errors } = spec.validate(
        undefined
      ) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<string>", () => {
      const spec = number;
      const { valid: invalid, errors } = spec.validate("foo") as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<object>", () => {
      const spec = number;
      const { valid: invalid, errors } = spec.validate({}) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<array>", () => {
      const spec = number;
      const { valid: invalid, errors } = spec.validate([]) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
  describe("has", () => {
    it("gt", () => {
      const spec = number.gt(5);
      const { valid } = spec.validate(6);
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec.validate(5) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("ge", () => {
      const spec = number.ge(3);
      const { valid } = spec.validate(3);
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec.validate(2) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("eq", () => {
      const spec = number.eq(3);
      const { valid } = spec.validate(3);
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec.validate(2) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("le", () => {
      const spec = number.le(5);
      const { valid } = spec.validate(5);
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec.validate(6) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("lt", () => {
      const spec = number.lt(6);
      const { valid } = spec.validate(3);
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec.validate(6) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("between", () => {
      const spec = number.between(3, 10);
      const { valid } = spec.validate(3);
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec.validate(42) as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
});
