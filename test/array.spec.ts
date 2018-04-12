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
});
