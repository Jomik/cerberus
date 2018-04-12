import "mocha";
import { expect } from "chai";
import { number, string, object } from "../src";
// tslint:disable:no-unused-expression

describe("or", () => {
  it("takes left", () => {
    const schema = number.or(string);
    expect(schema.validate(42)).to.be.valid;
  });
  it("takes right", () => {
    const schema = number.or(string);
    expect(schema.validate("foo")).to.be.valid;
  });
  it("rejects", () => {
    const schema = number.or(string);
    expect(schema.validate({})).to.not.be.valid;
  });
});

describe("and", () => {
  it("runs both", () => {
    const schema = object({ a: number }, { strict: false }).and(
      object({ b: number }, { strict: false })
    );
    expect(schema.validate({ a: 42, b: 42 })).to.be.valid;
  });
  it("stops left", () => {
    const schema = object({ a: number }, { strict: false }).and(
      object({ b: number }, { strict: false })
    );
    expect(schema.validate({ a: "foo", b: 42 })).to.not.be.valid;
  });
  it("stops right", () => {
    const schema = object({ a: number }, { strict: false }).and(
      object({ b: number }, { strict: false })
    );
    expect(schema.validate({ a: 42, b: "foo" })).to.not.be.valid;
  });
});
