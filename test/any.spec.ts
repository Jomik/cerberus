import "mocha";
import { expect } from "chai";
import { any, number } from "../src";
import { InvalidResult, ValidResult } from "../src/types";
// tslint:disable:no-unused-expression

describe("any", () => {
  describe("accepts", () => {
    it("anything not undefined", () => {
      const spec = any;
      const { valid } = spec.validate("foo");
      expect(valid).to.be.true;
    });
    it("optional", () => {
      const spec = any.optional();
      const { valid } = spec.validate(undefined);
      expect(valid).to.be.true;
    });
    it("optional defined", () => {
      const spec = any.optional();
      const { valid, obj } = spec.validate("foo") as ValidResult<"foo">;
      expect(valid).to.be.true;
      expect(obj).to.equal("foo");
    });
    it("default", () => {
      const spec = any.default(5);
      const { valid, obj } = spec.validate(undefined) as ValidResult<any>;
      expect(valid).to.be.true;
      expect(obj).to.be.equal(5);
    });
    it("default defined", () => {
      const spec = any.default(5);
      const { valid, obj } = spec.validate("foo") as ValidResult<any>;
      expect(valid).to.be.true;
      expect(obj).to.be.equal("foo");
    });
  });
  describe("rejects", () => {
    it("on undefined", () => {
      const spec = any;
      const { valid, errors } = spec.validate(undefined) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
  describe("chains", () => {
    it("fail > pass", () => {
      const spec = number.lt(3).ge(4);
      const { valid } = spec.validate(4) as ValidResult<number>;
      expect(valid).to.be.false;
    });
    it("pass > fail", () => {
      const spec = number.ge(3).lt(4);
      const { valid } = spec.validate(4) as ValidResult<number>;
      expect(valid).to.be.false;
    });
    it("pass > pass", () => {
      const spec = number.ge(3).le(4);
      const { valid } = spec.validate(4) as ValidResult<number>;
      expect(valid).to.be.true;
    });
    it("fail > fail", () => {
      const spec = number.le(3).lt(4);
      const { valid } = spec.validate(5) as ValidResult<number>;
      expect(valid).to.be.false;
    });
  });
});
