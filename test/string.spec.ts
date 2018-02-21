import "mocha";
import { expect } from "chai";
import { string } from "../src";
import { InvalidResult } from "../src/types";
import { NumericProperty } from "../src/constraints/property";
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
  describe("has props", () => {
    it("length", () => {
      expect(string.length).to.be.an.instanceof(NumericProperty);
    });
  });
  describe("has", () => {
    it("matches", () => {
      const spec = string.matches(/^[a-z]+$/);
      const { valid } = spec.validate("foo");
      expect(valid).to.be.true;
      const { valid: invalid } = spec.validate("@foo$");
      expect(invalid).to.be.false;
    });
    it("alphanum", () => {
      const spec = string.alphanum();
      const { valid } = spec.validate("foo");
      expect(valid).to.be.true;
      const { valid: invalid } = spec.validate("fOo bAr");
      expect(invalid).to.be.false;
    });
    it("email", () => {
      const spec = string.email();
      const { valid } = spec.validate("foo@bar.baz");
      expect(valid).to.be.true;
      const { valid: invalid } = spec.validate("fOo bAr@<>");
      expect(invalid).to.be.false;
    });
    it("includes", () => {
      const spec = string.includes("bar");
      const { valid } = spec.validate("foo bar baz");
      expect(valid).to.be.true;
      const { valid: invalid } = spec.validate("foo baz");
      expect(invalid).to.be.false;
    });
  });
});
