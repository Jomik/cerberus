import "mocha";
import * as QC from "proptest";
import { expect } from "chai";
import {
  def,
  undef,
  nil,
  any,
  boolean,
  ValidationError,
  object,
  number,
  string,
  array
} from "../src";
// tslint:disable:no-unused-expression

const property = QC.createProperty(it);

describe("trivial types", () => {
  it("boolean", () => {
    expect(boolean.validate(true), "boolean true").to.be.valid;
    expect(boolean.validate(false), "boolean false").to.be.valid;
    ["foo", 42, [], {}, undefined, null].forEach((e) => {
      expect(boolean.validate(e), `non boolean ${typeof e}`).to.not.be.valid;
    });
  });
  it("any", () => {
    ["foo", 42, [], {}, undefined, null, true].forEach((e) => {
      expect(any.validate(e), `any ${typeof e}`).to.be.valid;
    });
  });
  it("defined", () => {
    expect(def.validate(undefined), "not defined undefined").to.not.be.valid;
    expect(def.validate(null), "not defined null").to.not.be.valid;
    ["foo", 42, [], {}, true].forEach((e) => {
      expect(def.validate(e), `defined ${typeof e}`).to.be.valid;
    });
  });
  it("undefined", () => {
    expect(undef.validate(undefined)).to.be.valid;
    ["foo", 42, [], {}, null, true].forEach((e) => {
      expect(undef.validate(e), `not undefined ${typeof e}`).to.not.be.valid;
    });
  });
  it("null", () => {
    expect(nil.validate(null)).to.be.valid;
    ["foo", 42, [], {}, undefined, true].forEach((e) => {
      expect(nil.validate(e), `not null ${typeof e}`).to.not.be.valid;
    });
  });
});

describe("base methods", () => {
  describe("test", () => {
    expect(boolean.test(true)).to.equal(true);
    expect(() => boolean.test(undefined)).to.throw(ValidationError);
  });

  describe("optional", () => {
    const schema = boolean.optional();
    expect(schema.validate(undefined)).to.be.valid;
    expect(schema.validate("foo")).to.not.be.valid;
  });
  describe("default", () => {
    const schema = boolean.default(false);
    expect(schema.validate(undefined)).to.be.valid.and.have.result(false);
    expect(schema.validate("foo")).to.not.be.valid;
  });
});

describe("map", () => {
  it("runs on object", () => {
    const schema = object({ a: any }).map(({ a }) => a);
    expect(schema.validate({ a: 42 })).to.be.valid.and.have.result(42);
  });
  it("allows continuation", () => {
    const schema = object({ a: number, b: number })
      .map(({ a }) => a)
      .gt(2);
    expect(schema.validate({ a: 42, b: 0 })).to.be.valid.and.have.result(42);
  });
  it("stops on error", () => {
    const schema = object({ a: number }).map(({ a }) => a * 2);
    expect(schema.validate({ a: "foo" })).to.not.be.valid;
  });
});

describe("property", () => {
  describe("length", () => {
    it("string", () => {
      const schema = string.length((len) => len.gt(3));
      expect(schema.validate("foobar")).to.be.valid.and.have.result("foobar");
      expect(schema.validate("foo")).to.not.be.valid;
    });
    it("array", () => {
      const arraySchema = array(string).length((len) => len.gt(3));
      expect(arraySchema.validate(["a", "b", "c", "d"])).to.be.valid;
      expect(arraySchema.validate(["foobar"])).to.not.be.valid;
    });
  });
});

describe("method", () => {
  describe("includes", () => {
    it("string", () => {
      const schema = string.includes("foo");
      expect(schema.validate("foobar")).to.be.valid;
      expect(schema.validate("bar")).to.not.be.valid;
    });
    it("array", () => {
      const schema = array(number).includes(42);
      expect(schema.validate([1, 2, 42, 3])).to.be.valid;
      expect(schema.validate([1, 2, 3])).to.not.be.valid;
    });
  });
});
