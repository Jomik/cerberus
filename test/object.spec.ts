import "mocha";
import { expect } from "chai";
import { object, any, number, string } from "../src";
import { InvalidResult, ValidResult } from "../src/types";
import { array } from "../src/index";
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
      const spec = object({ b: any.optional() });
      const { valid } = spec.validate({});
      expect(valid).to.be.true;
    });
    it("flat default", () => {
      const spec = object({
        a: any.default(42),
        b: any.default("foo")
      });
      const { valid, obj } = spec.validate({}) as ValidResult<{
        a: any;
        b: any;
      }>;
      expect(valid).to.be.true;
      expect(obj).to.deep.equal({ a: 42, b: "foo" });
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
  });
  describe("rejects", () => {
    it("<string>", () => {
      const spec = object({});
      const { valid, errors } = spec.validate("foo") as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<number>", () => {
      const spec = object({});
      const { valid, errors } = spec.validate(42) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<boolean>", () => {
      const spec = object({});
      const { valid, errors } = spec.validate(true) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<undefined>", () => {
      const spec = object({});
      const { valid, errors } = spec.validate(undefined) as InvalidResult;
      const result = spec.validate(undefined);
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("<null>", () => {
      const spec = object({});
      const { valid, errors } = spec.validate(null) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("arrays", () => {
      const spec = object({});
      const { valid, errors } = spec.validate([]) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("undefined", () => {
      const spec = object({
        a: any
      });
      const { valid, errors } = spec.validate(undefined) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("wrong objects", () => {
      const spec = object({
        a: any,
        b: object({ foo: any, bar: any }),
        c: any,
        d: array(string)
      });
      const { valid, errors } = spec.validate({
        b: "foo",
        c: "bar",
        d: ["foo", "bar", 42]
      }) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(3);
    });
    it("wrong nested objects", () => {
      const spec = object({
        a: object({ b: any }),
        c: object({ d: number })
      });
      const { valid, errors } = spec.validate({
        a: {},
        c: { d: "foo" }
      }) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(2);
    });
  });
  describe("has", () => {
    describe("references", () => {
      it("accepts", () => {
        const spec = object({
          a: number.default(20),
          b: (o) => number.lt(o.a)
        });
        const { valid } = spec.validate({
          b: 10
        });
        expect(valid).to.be.true;
      });
      it("nested out", () => {
        const spec = object({
          a: number.default(42),
          b: (o) =>
            object({
              c: number.lt(o.a)
            })
        });
        const { valid } = spec.validate({ b: { c: 10 } });
        expect(valid).to.be.true;
      });
      it("nested in", () => {
        const spec = object({
          a: (o) => number.lt(o.b.c),
          b: object({
            c: number.default(42)
          })
        });
        const { valid } = spec.validate({ a: 10 });
        expect(valid).to.be.true;
      });
      it("handles undefined", () => {
        const foo = object({
          from: string,
          to: (o) =>
            string.satisfies(
              (obj) => o.from.length === obj.length,
              "foo",
              "bar"
            )
        });
        expect(foo.validate({ from: undefined, to: "foobar" }).valid).to.be
          .false;
      });
    });
    describe("extend", () => {
      it("accepts", () => {
        const spec = object({ a: string, b: string }).extend({ c: string });
        const { valid } = spec.validate({ a: "foo", b: "bar", c: "baz" });
        expect(valid).to.be.true;
      });
      it("overrides", () => {
        const spec = object({ a: string, b: string }).extend({ b: number });
        const { valid } = spec.validate({ a: "foo", b: 42 });
        expect(valid).to.be.true;
        const { valid: invalid, errors } = spec.validate({
          a: "foo",
          b: "bar"
        }) as InvalidResult;
        expect(invalid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
    });
    describe("strict", () => {
      it("accepts", () => {
        const spec = object({ a: string, b: number }).strict();
        const { valid } = spec.validate({ b: 42, a: "foo" });
        expect(valid).to.be.true;
      });
      it("missing", () => {
        const spec = object({
          a: string,
          b: number
        }).strict();
        const { valid, errors } = spec.validate({
          a: "bar"
        }) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("additional", () => {
        const spec = object({
          a: string,
          b: number,
          d: any.optional()
        }).strict();
        const { valid, errors } = spec.validate({
          a: "foo",
          b: 42,
          c: "baz"
        }) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(1);
      });
      it("type", () => {
        const spec = object({ a: string, b: number }).strict();
        const { valid, errors } = spec.validate({
          a: 42,
          b: "foo"
        }) as InvalidResult;
        expect(valid).to.be.false;
        expect(errors)
          .to.be.an("array")
          .of.length(2);
      });
    });
  });
});
