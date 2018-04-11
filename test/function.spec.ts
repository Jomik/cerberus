import "mocha";
import { expect } from "chai";
import { number, string, object } from "../src";
// tslint:disable:no-unused-expression

describe("or", () => {
  it("left", () => {
    const schema = number.or(string);
    expect(schema.validate(42)).to.be.valid;
  });
  it("right", () => {
    const schema = number.or(string);
    expect(schema.validate("foo")).to.be.valid;
  });
  it("rejects", () => {
    const schema = number.or(string);
    expect(schema.validate({})).to.not.be.valid;
  });
});

describe("xor", () => {
  it("left", () => {
    const schema = string.includes("foo").xor(string.includes("bar"));
    expect(schema.validate("foo")).to.be.valid;
  });
  it("right", () => {
    const schema = string.includes("foo").xor(string.includes("bar"));
    expect(schema.validate("bar")).to.be.valid;
  });
  it("both", () => {
    const schema = string.includes("foo").xor(string.includes("bar"));
    expect(schema.validate("foobar")).to.not.be.valid;
  });
  it("rejects", () => {
    const schema = string.includes("foo").xor(string.includes("bar"));
    expect(schema.validate("bum")).to.not.be.valid;
  });
});

describe("and", () => {
  it("runs both", () => {
    const schema = object({ a: number }).and(object({ b: number }));
    expect(schema.validate({ a: 42, b: 42 })).to.be.valid;
  });
  it("stops left", () => {
    const schema = object({ a: number }).and(object({ b: number }));
    expect(schema.validate({ a: "foo", b: 42 })).to.not.be.valid;
  });
  it("stops right", () => {
    const schema = object({ a: number }).and(object({ b: number }));
    expect(schema.validate({ a: 42, b: "foo" })).to.not.be.valid;
  });
});
