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
  // it("matches", () => {
  //   const schema = string.matches(/[a-z]+/);
  //   expect(schema.validate("foo")).to.be.valid;
  //   expect(schema.validate("BAR")).to.not.be.valid;
  // });
  // it("alphanum", () => {
  //   const schema = string.alphanum();
  //   expect(schema.validate("fooBAR1235")).to.be.valid;
  //   expect(schema.validate("foo_bar.car@bar.at.com")).to.not.be.valid;
  // });
});
