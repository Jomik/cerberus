import "mocha";
import { expect } from "chai";
import { InvalidResult } from "../src/types";
import { NumericProperty } from "../src/constraints/property";
import { string } from "../src/index";
import { StringSchema } from "../src/schemas/string";
// tslint:disable:no-unused-expression

describe("NumericProperty", () => {
  let spec: NumericProperty<string, StringSchema<string>>;
  beforeEach(() => {
    spec = new NumericProperty(
      "length",
      (string as any).chain.bind(string),
      StringSchema
    );
  });
  describe("tests", () => {
    it("greater than", () => {
      const { valid } = spec.gt(3).validate("foobar");
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec
        .gt(3)
        .validate("foo") as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("greater than or equal", () => {
      const { valid } = spec.ge(3).validate("foo");
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec
        .ge(3)
        .validate("fo") as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("equal", () => {
      const { valid } = spec.eq(3).validate("foo");
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec
        .eq(3)
        .validate("fo") as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("less than or equal", () => {
      const { valid } = spec.le(3).validate("foo");
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec
        .le(3)
        .validate("foobar") as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("less than", () => {
      const { valid } = spec.lt(3).validate("fo");
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec
        .lt(3)
        .validate("foo") as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("between", () => {
      const { valid } = spec.between(3, 10).validate("foobar");
      expect(valid).to.be.true;
      const { valid: invalid, errors } = spec
        .between(5, 10)
        .validate("foo") as InvalidResult;
      expect(invalid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
});
