import "mocha";
import { expect } from "chai";
import { any, number, string, object, array, thru } from "../src";
import { InvalidResult, ValidResult } from "../src/types";
import { validate } from "../src/index";
// tslint:disable:no-unused-expression

describe("any", () => {
  describe("accepts", () => {
    it("anything not undefined", () => {
      const spec = any;
      const { valid } = validate(spec, "foo");
      expect(valid).to.be.true;
    });
    it("optional", () => {
      const spec = any.optional();
      const { valid } = spec.validate(undefined);
      expect(valid).to.be.true;
    });
    it("optional defined", () => {
      const spec = any.optional();
      const { valid, obj } = spec.validate("foo") as ValidResult<any>;
      expect(valid).to.be.true;
      expect(obj).to.equal("foo");
    });
    it("default", () => {
      const spec = any.default(5);
      const { valid, obj } = spec.validate(undefined) as ValidResult<any>;
      expect(valid).to.be.true;
      expect(obj).to.be.equal(5);
    });
    it("default defined", () => {
      const spec = any.default(5);
      const { valid, obj } = spec.validate("foo") as ValidResult<any>;
      expect(valid).to.be.true;
      expect(obj).to.be.equal("foo");
    });
  });
  describe("rejects", () => {
    it("on undefined", () => {
      const spec = any;
      const { valid, errors } = spec.validate(undefined) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
  describe("chains", () => {
    it("fail > pass", () => {
      const spec = number.lt(3).ge(4);
      const { valid, errors } = spec.validate(4) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("pass > fail", () => {
      const spec = number.ge(3).lt(4);
      const { valid, errors } = spec.validate(4) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
    it("pass > pass", () => {
      const spec = number.ge(3).le(4);
      const { valid } = spec.validate(4);
      expect(valid).to.be.true;
    });
    it("fail > fail", () => {
      const spec = number.le(3).lt(4);
      const { valid, errors } = spec.validate(5) as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(2);
    });
    it("stops on fatal", () => {
      const spec = number.eq(5);
      const { valid, errors } = spec.validate("foo") as InvalidResult;
      expect(valid).to.be.false;
      expect(errors)
        .to.be.an("array")
        .of.length(1);
    });
  });
  describe("satisfies", () => {
    it("accepts", () => {
      const { valid } = any
        .satisfies((o) => o === "foo", "be foo", "equal")
        .validate("foo");
      expect(valid).to.be.true;
    });
    it("has type", () => {
      const { valid } = string
        .satisfies((o) => o === "foo", "be foo", "equal")
        .length.eq(3)
        .validate("foo");
      expect(valid).to.be.true;
    });
    it("rejects", () => {
      const { valid } = any
        .satisfies((o) => false, "impossible", "equal")
        .validate("foo");
      expect(valid).to.be.false;
    });
  });
  describe("thru", () => {
    it("starts", () => {
      const spec = thru((n) => n.substring(3)).and(number.between(20, 42));
      const { valid } = spec.validate("foo23");
      expect(valid).to.be.true;
    });
    it("processes", () => {
      const person = object({ name: string, id: number });
      const schema = person.extend({
        mother: person,
        father: person,
        children: array(person).thru((a) => a.map((e) => e.name))
      });
      const person1 = { name: "Foo Bar", id: 1 };
      const person2 = { name: "Foo Buz", id: 2 };
      const person3 = { name: "Bar FooBar", id: 3 };
      const person4 = {
        name: "Buz FooBar",
        id: 4,
        father: person1,
        mother: person2,
        children: [person3]
      };
      const person5 = {
        name: "Buz FooBar",
        id: 4,
        father: person1,
        mother: person2,
        children: "foo"
      };
      const res = schema.validate(person4);
      expect(res.valid).to.be.true;
      if (res.valid) {
        expect(res.obj.children)
          .to.an("array")
          .that.includes(person3.name);
      }
      expect(schema.validate(person5).valid).to.be.false;
    });
  });
});
