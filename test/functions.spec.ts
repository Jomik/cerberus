import "mocha";
import { expect, assert } from "chai";
import { InvalidResult } from "../src/types";
import {
  oneOf,
  is,
  string,
  number,
  object,
  alternatives,
  forbidden,
  any,
  boolean,
  array
} from "../src";
import { StringType } from "../src/types/string";
import { NumberType } from "../src/types/number";
// tslint:disable:no-unused-expression

describe("check", () => {
  describe("accepts", () => {
    it("<any>", () => {
      expect(any.check("foo")).to.be.true;
    });
    it("<array>", () => {
      expect(array(string).check(["foo", "bar"])).to.be.true;
    });
    it("<boolean>", () => {
      expect(boolean.check(false)).to.be.true;
    });
    it("<number>", () => {
      expect(number.check(42)).to.be.true;
    });
    it("<object>", () => {
      expect(object({ foo: string }).check({ foo: "foo" })).to.be.true;
    });
    it("<string>", () => {
      expect(string.check("foo")).to.be.true;
    });
  });
  describe("rejects", () => {
    it("<any>", () => {
      expect(any.check(undefined)).to.be.false;
    });
    it("<array>", () => {
      expect(array(string).check([42, "bar"])).to.be.false;
    });
    it("<boolean>", () => {
      expect(boolean.check(42)).to.be.false;
    });
    it("<number>", () => {
      expect(number.check("foo")).to.be.false;
    });
    it("<object>", () => {
      expect(object({ foo: string }).check({ bar: "foo" })).to.be.false;
    });
    it("<string>", () => {
      expect(string.check(42)).to.be.false;
    });
  });
});

describe("test", () => {
  describe("accepts", () => {
    it("<any>", () => {
      expect(any.test("foo")).to.equal("foo");
    });
    it("<array>", () => {
      expect(array(string).test(["foo", "bar"])).to.deep.equal(["foo", "bar"]);
    });
    it("<boolean>", () => {
      expect(boolean.test(false)).to.equal(false);
    });
    it("<number>", () => {
      expect(number.test(42)).to.equal(42);
    });
    it("<object>", () => {
      expect(object({ foo: string }).test({ foo: "foo" })).to.deep.equal({
        foo: "foo"
      });
    });
    it("<string>", () => {
      expect(string.test("foo")).to.equal("foo");
    });
  });
  describe("throws", () => {
    it("<any>", () => {
      assert.throws(() => any.test(undefined));
    });
    it("<array>", () => {
      assert.throws(() => array(string).test([42, "bar"]));
    });
    it("<boolean>", () => {
      assert.throws(() => boolean.test(42));
    });
    it("<number>", () => {
      assert.throws(() => number.test("foo"));
    });
    it("<object>", () => {
      assert.throws(() => object({ foo: string }).test({ bar: "foo" }));
    });
    it("<string>", () => {
      assert.throws(() => string.test(42));
    });
  });
});

describe("oneOf", () => {
  describe("accepts", () => {
    it("<string>", () => {
      const spec = oneOf("foo", "bar", "baz");
      const { valid: valid1 } = spec.validate("foo");
      expect(valid1).to.be.true;
      const { valid: valid2 } = spec.validate("bar");
      expect(valid2).to.be.true;
      const { valid: valid3 } = spec.validate("baz");
      expect(valid3).to.be.true;
    });
    it("<number>", () => {
      const spec = oneOf(1, 2, 3);
      const { valid: valid1 } = spec.validate(1);
      expect(valid1).to.be.true;
      const { valid: valid2 } = spec.validate(2);
      expect(valid2).to.be.true;
      const { valid: valid3 } = spec.validate(3);
      expect(valid3).to.be.true;
      spec.validate(2);
    });
    it("<any>", () => {
      const spec = oneOf("foo", 42, { a: "bar", b: { c: "foo" } }, [
        "bum",
        ["foo"]
      ]);
      const { valid: valid1 } = spec.validate("foo");
      expect(valid1).to.be.true;
      const { valid: valid2 } = spec.validate(42);
      expect(valid2).to.be.true;
      const { valid: valid3 } = spec.validate({ a: "bar", b: { c: "foo" } });
      expect(valid3).to.be.true;
      const { valid: valid4 } = spec.validate(["bum", ["foo"]]);
      expect(valid4).to.be.true;
    });
  });
  describe("rejects", () => {
    it("wrong with one option", () => {
      const spec = oneOf("foo");
      const { valid, errors } = spec.validate("bar") as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("wrong with multiple options", () => {
      const spec = oneOf("foo", "bar", "baz");
      const { valid, errors } = spec.validate("buz") as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
});

describe("is", () => {
  describe("accepts", () => {
    it("<string>", () => {
      const spec = is("foo");
      const { valid } = spec.validate("foo");
      expect(valid).to.be.true;
    });
    it("<number>", () => {
      const spec = is(42);
      const { valid } = spec.validate(42);
      expect(valid).to.be.true;
    });
    it("<boolean>", () => {
      const spec = is(false);
      const { valid } = spec.validate(false);
      expect(valid).to.be.true;
    });
    it("<array>", () => {
      const spec = is(["foo", ["bar"]]);
      const { valid } = spec.validate(["foo", ["bar"]]);
      expect(valid).to.be.true;
    });
    it("<object>", () => {
      const spec = is({ a: "bar", b: { c: "foo" } });
      const { valid } = spec.validate({ a: "bar", b: { c: "foo" } });
      expect(valid).to.be.true;
    });
  });
  describe("rejects", () => {
    it("wrong", () => {
      const spec = is("foo");
      const { valid, errors } = spec.validate("buz") as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("wrong type", () => {
      const spec = is("foo");
      const { valid, errors } = spec.validate(42) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("array with object spec", () => {
      const spec = is({ a: "foo" });
      const { valid, errors } = spec.validate(["foo"]) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("object with array spec", () => {
      const spec = is(["foo"]);
      const { valid, errors } = spec.validate({ a: "foo" }) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
});

describe("alternatives", () => {
  it("accepts", () => {
    const spec = alternatives(string, number);
    expect(spec.validate("foo").valid).to.be.true;
    expect(spec.validate(42).valid).to.be.true;
  });
  it("rejects", () => {
    const spec = alternatives(string, number);
    expect(spec.validate([]).valid).to.be.false;
  });
});

describe("forbidden", () => {
  it("accepts", () => {
    const spec = object({ a: forbidden, b: string }).strict();
    const { valid } = spec.validate({ b: "foo" });
    expect(valid).to.be.true;
  });
  it("rejects", () => {
    const spec = object({ a: forbidden, b: string });
    const { valid: invalid } = spec.strict().validate({ a: "foo", b: "bar" });
    expect(invalid).to.be.false;
  });
});
