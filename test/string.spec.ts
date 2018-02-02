import "mocha";
import { expect } from "chai";
import { string } from "../src";
import { InvalidResult } from "../src/types";
// tslint:disable:no-unused-expression

describe("string", () => {
  describe("accepts", () => {
    it("any string", () => {
      const spec = string;
      const { valid } = spec.validate("foo");
      expect(valid).to.be.true;
    });
  });
  describe("rejects", () => {
    describe("primitives", () => {
      it("<number>", () => {
        const spec = string;
        const { valid, errors } = spec.validate(42) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("<boolean>", () => {
        const spec = string;
        const { valid, errors } = spec.validate(true) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("<undefined>", () => {
        const spec = string;
        const { valid, errors } = spec.validate(undefined) as InvalidResult;
        const result = spec.validate(undefined);
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("<null>", () => {
        const spec = string;
        const { valid, errors } = spec.validate(null) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
    });
    it("arrays", () => {
      const spec = string;
      const { valid, errors } = spec.validate([]) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("objects", () => {
      const spec = string;
      const { valid, errors } = spec.validate({ c: "foo" }) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
  describe("tests", () => {
    describe("length", () => {
      it("gt", () => {
        const spec = string.length.gt(5);
        const { valid } = spec.validate("foobar");
        expect(valid).to.be.true;
        const { valid: invalid, errors } = spec.validate(
          "foo"
        ) as InvalidResult;
        expect(invalid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("ge", () => {
        const spec = string.length.ge(3);
        const { valid } = spec.validate("foo");
        expect(valid).to.be.true;
        const { valid: invalid, errors } = spec.validate("f") as InvalidResult;
        expect(invalid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("eq", () => {
        const spec = string.length.eq(3);
        const { valid } = spec.validate("foo");
        expect(valid).to.be.true;
        const { valid: invalid, errors } = spec.validate("f") as InvalidResult;
        expect(invalid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("le", () => {
        const spec = string.length.le(3);
        const { valid } = spec.validate("foo");
        expect(valid).to.be.true;
        const { valid: invalid, errors } = spec.validate(
          "foobar"
        ) as InvalidResult;
        expect(invalid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("lt", () => {
        const spec = string.length.lt(6);
        const { valid } = spec.validate("foo");
        expect(valid).to.be.true;
        const { valid: invalid, errors } = spec.validate(
          "foobar"
        ) as InvalidResult;
        expect(invalid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
    });
    describe("includes", () => {
      it("accepts", () => {
        const spec = string.includes("bar");
        const { valid } = spec.validate("foo bar baz");
        expect(valid).to.be.true;
      });
      it("rejects", () => {
        const spec = string.includes("bar");
        const { valid } = spec.validate("foo baz");
        expect(valid).to.be.false;
      });
    });
  });
});
