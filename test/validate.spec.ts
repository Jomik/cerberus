import "mocha";
import { expect } from "chai";
import { validate } from "../src";
import * as schema from "../src";

describe("primitives", () => {
  describe("validates", () => {
    it("any", () => {
      const spec = schema.any;
      const { valid } = validate(spec, {});
      expect(valid).to.equal(true);
    });
    it("optional", () => {
      const spec = schema.any.optional();
      const { valid, obj } = validate(spec, undefined);
      expect(valid).to.equal(true);
      expect(obj).to.equal(undefined);
    });
    it("optional", () => {
      const spec = schema.any.default(50);
      const { valid, obj } = validate(spec, undefined);
      expect(valid).to.equal(true);
      expect(obj).to.equal(50);
    });
    it("string", () => {
      const spec = schema.string;
      const { valid } = validate(spec, "foo");
      expect(valid).to.equal(true);
    });
    it("chains", () => {
      const spec = schema.string.length.min(3).length.max(5);
      const { valid } = validate(spec, "foo");
      expect(valid).to.equal(true);
    });
  });
  describe("errors", () => {
    it("shows error", () => {
      const spec = schema.string;
      const result: any = validate(spec, 1);
      expect(result.valid).to.equal(false);
    });
    it("shows multiple errors", () => {
      const spec = schema.string.length.exact(3).length.exact(5);
      const result: any = validate(spec, "fo");
      expect(result.valid).to.equal(false);
      expect(result.errors)
        .to.be.an("array")
        .of.length(2);
    });
  });
});

describe("object", () => {
  describe("simple", () => {
    it("validates", () => {
      const spec = schema.object({
        a: schema.string,
        n: schema.number
      });
      const { valid } = validate(spec, { a: "foo", n: 10 });
      expect(valid).to.equal(true);
    });
    it("defaults", () => {
      const spec = schema.object({
        a: schema.string.default("foo"),
        n: schema.number.default(42)
      });
      const { valid, obj } = validate(spec, {});
      expect(valid).to.equal(true);
      expect(obj.a).to.equal("foo");
      expect(obj.n).to.equal(42);
    });
    it("errors", () => {
      const spec = schema.object({
        a: schema.string,
        n: schema.number
      });
      const result: any = validate(spec, { n: "foo", a: 10 });
      expect(result.valid).to.equal(false);
    });
  });
  describe("nested", () => {
    it("validates", () => {
      const spec = schema.object({
        a: schema.object({
          b: schema.string,
          c: schema.number
        }),
        n: schema.number
      });
      const { valid } = validate(spec, { a: { b: "foo", c: 42 }, n: 10 });
      expect(valid).to.equal(true);
    });
    it("errors", () => {
      const spec = schema.object({
        a: schema.object({
          b: schema.string,
          c: schema.number
        }),
        n: schema.number
      });
      const result: any = validate(spec, { a: { b: 2, c: 42 }, n: 10 });
      expect(result.valid).to.equal(false);
    });
    it("shows multiple errors", () => {
      const spec = schema.object({
        a: schema.object({
          b: schema.string,
          c: schema.number
        }),
        n: schema.number
      });
      const result: any = validate(
        spec,
        { a: { b: 2, c: "foo" }, n: "foo" },
        "body"
      );
      expect(result.valid).to.equal(false);
      expect(result.errors)
        .to.be.an("array")
        .of.length(3);
    });
  });
  describe("not object", () => {
    it("errors", () => {
      const spec = schema.object({
        a: schema.number
      });
      const { valid } = validate(spec, "");
      expect(valid).to.equal(false);
    });
  });
});
