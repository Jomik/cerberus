import "mocha";
import { expect } from "chai";
import { object, any, number } from "../src";
import { InvalidResult, ValidResult } from "../src/types";
// tslint:disable:no-unused-expression

describe("object", () => {
  describe("accepts", () => {
    it("empty", () => {
      const spec = object({});
      const { valid } = spec.validate({});
      expect(valid).to.be.true;
    });
    it("flat", () => {
      const spec = object({ a: any, b: any });
      const { valid } = spec.validate({ a: 42, b: "foo" });
      expect(valid).to.be.true;
    });
    it("nested", () => {
      const spec = object({
        a: object({ b: any }),
        c: object({ d: any })
      });
      const { valid } = spec.validate({ a: { b: 42 }, c: { d: "foo" } });
      expect(valid).to.be.true;
    });
    it("optional", () => {
      const spec = object({ a: any, b: any.optional() });
      const { valid } = spec.validate({ a: 42 });
      expect(valid).to.be.true;
    });
    it("flat default", () => {
      const spec = object({
        a: any.default(42),
        b: any.default("foo")
      });
      const result = spec.validate({}) as ValidResult<{
        a: any;
        b: any;
      }>;
      expect(result.valid).to.be.true;
      expect(result.obj).to.deep.equal({ a: 42, b: "foo" });
    });
    it("nested default", () => {
      const spec = object({
        a: object({ b: any.default(42) }),
        c: object({ d: any.default("foo") })
      });
      const result = spec.validate({ a: {}, c: {} }) as ValidResult<{
        a: { b: any };
        c: { d: any };
      }>;
      expect(result.valid).to.be.true;
      expect(result.obj).to.deep.equal({ a: { b: 42 }, c: { d: "foo" } });
    });
    it("references", () => {
      const spec = object({
        a: number.default(20),
        b: (o) => number.max(o.a)
      });
      const { valid } = spec.validate({
        b: 10
      });
      expect(valid).to.be.true;
    });
    it("references nested", () => {
      const spec = object({
        a: number.default(42),
        b: (o) =>
          object({
            c: number.max(o.a)
          })
      });
      const { valid } = spec.validate({ b: { c: 10 } });
      expect(valid).to.be.true;
    });
  });
  describe("rejects", () => {
    describe("primitives", () => {
      it("<string>", () => {
        const spec = object({});
        const { valid, errors } = spec.validate("foo") as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("foo");
      });
      it("<number>", () => {
        const spec = object({});
        const { valid, errors } = spec.validate(42) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("42");
      });
      it("<boolean>", () => {
        const spec = object({});
        const { valid, errors } = spec.validate(true) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("true");
      });
      it("<undefined>", () => {
        const spec = object({});
        const { valid, errors } = spec.validate(undefined) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("undefined");
      });
      it("<null>", () => {
        const spec = object({});
        const { valid, errors } = spec.validate(null) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("null");
      });
    });
    it("arrays", () => {
      const spec = object({});
      const { valid, errors } = spec.validate([]) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
      expect(errors[0])
        .to.be.a("string")
        .that.includes("[]");
    });
  });
});
