import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
import { ValidationError } from "../src";

chai.use((_chai) => {
  _chai.Assertion.addProperty("valid", function() {
    const result = this._obj.result;
    const error = result.error ? result.error.details() : undefined;
    this.assert(
      this._obj.match({ valid: () => true, invalid: () => false }),
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
