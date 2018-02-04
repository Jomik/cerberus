import "mocha";
import { expect } from "chai";
import { array, any, string } from "../src";
import { InvalidResult, ValidResult } from "../src/types";
import { object } from "../src/index";
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
});
