import "mocha";
import { expect } from "chai";
import { array, any, string } from "../src";
import { InvalidResult, ValidResult } from "../src/types";
import { object } from "../src/index";
import { NumericProperty } from "../src/constraints/property";
// tslint:disable:no-unused-expression

describe("array", () => {
  describe("accepts", () => {
    it("empty", () => {
      const spec = array(any);
      const { valid } = spec.validate([]);
      expect(valid).to.be.true;
    });
    it("flat", () => {
      const spec = array(any);
      const { valid } = spec.validate(["foo", 2]);
      expect(valid).to.be.true;
    });
    it("nested", () => {
      const spec = array(array(any));
      const { valid } = spec.validate([["foo"], [2]]);
      expect(valid).to.be.true;
    });
  });
  describe("rejects", () => {
    it("<null>", () => {
      const spec = array(any);
      const { valid, errors } = spec.validate(null) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("wrong", () => {
      const spec = array(string);
      const { valid, errors } = spec.validate([
        "foo",
        42,
        "bar"
      ]) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("multiple wrong", () => {
      const spec = array(string);
      const { valid, errors } = spec.validate([1, 2, 3]) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(3);
    });
    it("nested wrong", () => {
      const spec = array(array(string));
      const { valid, errors } = spec.validate([
        [1],
        ["foo"],
        [3]
      ]) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(2);
    });
  });
  describe("has props", () => {
    describe("length", () => {
      expect(array(string).length).to.be.an.instanceof(NumericProperty);
    });
  });
  describe("tests", () => {
    describe("includes", () => {
      it("accepts", () => {
        const spec = array(string).includes("bar");
        const { valid } = spec.validate(["foo", "bar", "baz"]);
        expect(valid).to.be.true;
        const specObj = array(object({ a: any })).includes({ a: "foo" });
        const { valid: validObj } = specObj.validate([
          { a: "foo" },
          { a: "bar" },
          { a: "baz" }
        ]);
        expect(validObj).to.be.true;
      });
      it("rejects", () => {
        const spec = array(string).includes("bar");
        const { valid } = spec.validate(["foo", "baz"]);
        expect(valid).to.be.false;
        const specObj = array(object({ a: any })).includes({ a: "foo" });
        const { valid: validObj } = specObj.validate([
          { a: "bum" },
          { a: "bar" },
          { a: "baz" }
        ]);
        expect(validObj).to.be.false;
      });
    });
  });
});
