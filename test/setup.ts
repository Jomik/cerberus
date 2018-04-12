import * as chai from "chai";
import { ValidResult, InvalidResult, ValidationError } from "../src";

chai.use((_chai) => {
  _chai.Assertion.addProperty("valid", function() {
    const result = this._obj.result;
    const error = result.error ? result.error.details() : undefined;
    this.assert(
      this._obj instanceof ValidResult,
      "expected a valid result, but got error #{act}",
      "expected an invalid result",
      undefined,
      error
    );
  });
  _chai.Assertion.addMethod("result", function(expected) {
    new _chai.Assertion(this._obj.result.object).to.deep.equal(expected);
  });
});
