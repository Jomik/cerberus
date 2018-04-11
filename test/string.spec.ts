import "mocha";
import { expect } from "chai";
import { string } from "../src";
// tslint:disable:no-unused-expression

describe("string", () => {
  it("accepts string", () => {
    const result = string.validate("foo");
    expect(result).to.be.valid.and.have.result("foo");
  });
  it("rejects others", () => {
    [42, {}, [], true].forEach((e) => {
      expect(string.validate(e), `reject ${typeof e}`).to.not.be.valid;
    });
  });
  it("includes", () => {
    const schema = string.includes("foo");
    expect(schema.validate("barfoobaz")).to.be.valid;
    expect(schema.validate("baroobaz")).to.not.be.valid;
  });
});
