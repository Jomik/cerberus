import "mocha";
import * as QC from "proptest";
import { expect } from "chai";
import { number, integer } from "../src";
// tslint:disable:no-unused-expression

const property = QC.createProperty(it);

describe("number", () => {
  it("accepts numbers", () => {
    expect(number.validate(42)).to.be.valid.and.have.result(42);
  });
  it("rejects others", () => {
    ["foo", {}, [], true].forEach((e) => {
      expect(number.validate(e), `reject ${typeof e}`).to.not.be.valid;
    });
  });
  it("integer", () => {
    expect(integer.validate(42)).to.be.valid;
    expect(integer.validate(42.42)).to.not.be.valid;
  });
  property(
    "multiple",
    QC.int.two(),
    ([x, y]) => number.multiple(x).validate(y).result.valid === (y % x === 0)
  );
  property(
    "positive",
    QC.int,
    (x) => number.positive().validate(x).result.valid === x > 0
  );
  property(
    "negative",
    QC.int,
    (x) => number.negative().validate(x).result.valid === x < 0
  );
  property(
    "between",
    QC.int.three(),
    ([x, y, z]) =>
      number.between(y, z).validate(x).result.valid === (x > y && x < z)
  );
  describe("relations", () => {
    property(
      "gt",
      QC.int.two(),
      ([x, y]) => number.gt(x).validate(y).result.valid === y > x
    );
    property(
      "ge",
      QC.int.two(),
      ([x, y]) => number.ge(x).validate(y).result.valid === y >= x
    );
    property(
      "equal",
      QC.int.two(),
      ([x, y]) => number.equal(x).validate(y).result.valid === (y === x)
    );
    property(
      "le",
      QC.int.two(),
      ([x, y]) => number.le(x).validate(y).result.valid === y <= x
    );
    property(
      "lt",
      QC.int.two(),
      ([x, y]) => number.lt(x).validate(y).result.valid === y < x
    );
  });
});
