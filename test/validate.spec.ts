import "mocha";
import { expect } from "chai";
import { validate, schema } from "../src";
import { StringSchema } from "../src/schemas/string";
import { Schema } from "../src/schemas/any";
import { NumberSchema } from "../src/schemas/number";

describe("primitives", () => {
  describe("#validates", () => {
    it("any", () => {
      const spec = schema.any();
      const { valid } = validate(spec, {});
      expect(valid).to.equal(true);
    });
    it("optional", () => {
      const spec = schema.any().optional();
      const { valid } = validate(spec, undefined);
      expect(valid).to.equal(true);
    });
    it("string", () => {
      const spec = schema.oneOf(1, 2, 3);
      const { valid } = validate(spec, "foo");
      expect(valid).to.equal(true);
    });
    describe("#or", () => {
      it("validates left", () => {
        const spec = schema.string("foo").or(schema.string("bar"));
        const { valid } = validate(spec, "foo");
        expect(valid).to.equal(true);
      });
      it("validates right", () => {
        const spec = schema.string("foo").or(schema.string("bar"));
        const { valid } = validate(spec, "bar");
        expect(valid).to.equal(true);
      });
      it("errors", () => {
        const spec = schema.string("foo").or(schema.string("bar"));
        const result: any = validate(spec, "baz");
        expect(result.valid).to.equal(false);
        expect(result.errors)
          .to.be.an("array")
          .of.length(2);
      });
      it("keeps type", () => {
        const spec = schema.string("foo").or(schema.string("bar"));
        expect(spec).to.be.an.instanceOf(StringSchema);
      });
      it("allows multi type", () => {
        const spec = schema.string("foo").or(schema.number());
        const { valid } = validate(spec, 3);
        expect(valid).to.equal(true);
      });
    });
    describe("#and", () => {
      it("validates both", () => {
        const spec = schema
          .string()
          .length.min(3)
          .length.max(5);
        const { valid } = validate(spec, "foo");
        expect(valid).to.equal(true);
      });
    });
  });
});

describe("object", () => {
  describe("simple", () => {
    it("validates", () => {
      const spec = schema.object({
        a: schema.string(),
        n: schema.number()
      });
      const { valid } = validate(spec, { a: "foo", n: 10 });
      expect(valid).to.equal(true);
    });
    it("errors", () => {
      const spec = schema.object({
        a: schema.string(),
        n: schema.number()
      });
      const result: any = validate(spec, { n: "foo", a: 10 });
      expect(result.valid).to.equal(false);
      expect(result.errors)
        .to.be.an("array")
        .of.length(2);
    });
  });
  describe("nested", () => {
    it("validates", () => {
      const spec = schema.object({
        a: schema.object({
          b: schema.string(),
          c: schema.number()
        }),
        n: schema.number()
      });
      const { valid } = validate(spec, { a: { b: "foo", c: 42 }, n: 10 });
      expect(valid).to.equal(true);
    });
  });
});
