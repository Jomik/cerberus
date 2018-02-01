import "mocha";
import { expect } from "chai";
import { validate } from "../src";
import * as schema from "../src";
import { InvalidResult, ValidResult } from "../src/types";
// tslint:disable:no-unused-expression

describe("object", () => {
  describe("accepts", () => {
    it("empty", () => {
      const spec = schema.object({});
      const { valid } = validate(spec, {});
      expect(valid).to.be.true;
    });
    it("flat", () => {
      const spec = schema.object({ a: schema.any, b: schema.any });
      const { valid } = validate(spec, { a: 42, b: "foo" });
      expect(valid).to.be.true;
    });
    it("nested", () => {
      const spec = schema.object({
        a: schema.object({ b: schema.any }),
        c: schema.object({ d: schema.any })
      });
      const { valid } = validate(spec, { a: { b: 42 }, c: { d: "foo" } });
      expect(valid).to.be.true;
    });
    it("optional", () => {
      const spec = schema.object({ a: schema.any, b: schema.any.optional() });
      const { valid } = validate(spec, { a: 42 });
      expect(valid).to.be.true;
    });
    it("flat default", () => {
      const spec = schema.object({
        a: schema.any.default(42),
        b: schema.any.default("foo")
      });
      const result = validate(spec, {}) as ValidResult<{
        a: any;
        b: any;
      }>;
      expect(result.valid).to.be.true;
      expect(result.obj).to.deep.equal({ a: 42, b: "foo" });
    });
    it("nested default", () => {
      const spec = schema.object({
        a: schema.object({ b: schema.any.default(42) }),
        c: schema.object({ d: schema.any.default("foo") })
      });
      const result = validate(spec, { a: {}, c: {} }) as ValidResult<{
        a: { b: any };
        c: { d: any };
      }>;
      expect(result.valid).to.be.true;
      expect(result.obj).to.deep.equal({ a: { b: 42 }, c: { d: "foo" } });
    });
  });
  describe("rejects", () => {
    describe("primitives", () => {
      it("<string>", () => {
        const spec = schema.object({});
        const { valid, errors } = validate(spec, "foo") as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("foo");
      });
      it("<number>", () => {
        const spec = schema.object({});
        const { valid, errors } = validate(spec, 42) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("42");
      });
      it("<boolean>", () => {
        const spec = schema.object({});
        const { valid, errors } = validate(spec, true) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("true");
      });
      it("<undefined>", () => {
        const spec = schema.object({});
        const { valid, errors } = validate(spec, undefined) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
        expect(errors[0])
          .to.be.a("string")
          .that.includes("undefined");
      });
      it("<null>", () => {
        const spec = schema.object({});
        const { valid, errors } = validate(spec, null) as InvalidResult;
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
      const spec = schema.object({});
      const { valid, errors } = validate(spec, []) as InvalidResult;
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
