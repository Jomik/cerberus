import "mocha";
import { expect } from "chai";
import { array, any, number } from "../src";
// tslint:disable:no-unused-expression

describe("array", () => {
  it("accepts arrays", () => {
    expect(array(any).validate([42])).to.be.valid.and.have.result([42]);
  });
  it("rejects others", () => {
    ["foo", 42, {}, true].forEach((e) => {
      expect(array(any).validate(e), `reject ${typeof e}`).to.not.be.valid;
    });
  });
  it("rejects wrong entries", () => {
    expect(array(number).validate(["foo", 42, "bar"])).to.not.be.valid;
  });
  it("async", async () => {
    const schema = array(number.mapAsync((v) => Promise.resolve(v * 2)));
    expect(await schema.asyncValidate([1, 2, 3])).to.be.valid.and.have.result([
      2,
      4,
      6
    ]);
    ["foo", 42, {}, true].forEach(async (e) => {
      expect(await array(any).asyncValidate(e), `reject ${typeof e}`).to.not.be
        .valid;
    });
  });
});
