import "mocha";
import { expect } from "chai";
import { object, any, number, string } from "../src";
// tslint:disable:no-unused-expression

describe("object", () => {
  it("accepts objects", () => {
    const schema = object({ a: any });
    expect(schema.validate({ a: 42 })).to.be.valid.and.have.result({
      a: 42
    });
  });
  it("rejects others", () => {
    ["foo", 42, [], true].forEach((e) => {
      expect(object({}).validate(e), `reject ${typeof e}`).to.not.be.valid;
    });
  });
  it("rejects wrong properties", () => {
    const schema = object({ a: number, b: string });
    expect(
      schema.validate({
        a: "foo",
        b: 42
      })
    ).to.not.be.valid;
  });
  it("lazy properties", () => {
    const schema = object({
      c: number,
      b: ({ a, c }: { a: number; c: number }) => number.greater(a - c),
      a: number
    });
    expect(schema.validate({ a: 20, b: 42, c: 0 }).result.valid, "accept lazy")
      .to.be.true;
    expect(schema.validate({ a: 42, b: 0, c: 20 }).result.valid, "reject lazy")
      .to.be.false;
  });
  it("rest option", () => {
    const schema = object({}, { rest: string });
    expect(schema.validate({ a: "foo" }), "accept rest").to.be.valid;
    expect(schema.validate({ a: 42 }), "reject rest").to.not.be.valid;
    const lazySchema = object(
      { a: number },
      { rest: ({ a }: { a: number }) => number.greater(a) }
    );
    expect(lazySchema.validate({ a: 42, b: 43 }), "accept lazy rest").to.be
      .valid;
  });
  it("strict option", () => {
    const schema = object({ a: any }, { strict: true });
    expect(schema.validate({ a: 42 }), "accept strict").to.be.valid;
    expect(schema.validate({ a: 42, b: 42 }), "reject strict").to.not.be.valid;
  });
  it("non strict option", () => {
    const schema = object({ a: number });
    expect(schema.validate({ a: 42, b: 42 })).to.be.valid.and.have.result({
      a: 42,
      b: 42
    });
  });
});
