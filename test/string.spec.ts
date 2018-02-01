import "mocha";
import { expect } from "chai";
import { string, number } from "../src";
import { test } from "./utils";
import { InvalidResult } from "../src/types";
import { NumberComparisons } from "../src/schemas/schema";
import { StringSchema } from "../src/schemas/string";
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
        expect(errors[0].toString())
          .to.be.a("string")
          .that.includes("42");
      });
      it("<boolean>", () => {
        const spec = string;
        const { valid, errors } = spec.validate(true) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0].toString())
          .to.be.a("string")
          .that.includes("true");
      });
      it("<undefined>", () => {
        const spec = string;
        const { valid, errors } = spec.validate(undefined) as InvalidResult;
        const result = spec.validate(undefined);
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0].toString())
          .to.be.a("string")
          .that.includes("undefined");
      });
      it("<null>", () => {
        const spec = string;
        const { valid, errors } = spec.validate(null) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0].toString())
          .to.be.a("string")
          .that.includes("null");
      });
    });
    it("arrays", () => {
      const spec = string;
      const { valid, errors } = spec.validate([]) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
      expect(errors[0].toString())
        .to.be.a("string")
        .that.includes("[]");
    });
    it("objects", () => {
      const spec = string;
      const { valid, errors } = spec.validate({ c: "foo" }) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
      expect(errors[0].toString())
        .to.be.a("string")
        .that.includes("object");
    });
  });
  describe("has", () => {
    describe("length", () => {
      it("gt", () => {
        test(string.length.gt(5), ["foobar"], ["foo"]);
      });
      it("ge", () => {
        test(string.length.ge(3), ["foo", "foobar"], ["f"]);
      });
      it("eq", () => {
        test(string.length.eq(3), ["foo"], ["f", "foobar"]);
      });
      it("le", () => {
        test(string.length.le(3), ["f", "foo"], ["foobar"]);
      });
      it("lt", () => {
        test(string.length.lt(6), ["foo"], ["foobar"]);
      });
    });
  });
});
