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
    "positive",
    QC.int,
    (x) => number.positive().validate(x).info.valid === x > 0
  );
  property(
    "negative",
    QC.int,
    (x) => number.negative().validate(x).info.valid === x < 0
  );
  property(
    "between",
    QC.int.three(),
    ([x, y, z]) =>
      number.between(y, z).validate(x).info.valid === (x > y && x < z)
  );
  describe("relations", () => {
    property(
      "greater",
      QC.int.two(),
      ([x, y]) => number.greater(x).validate(y).info.valid === y > x
    );
    property(
      "greaterEqual",
      QC.int.two(),
      ([x, y]) => number.greaterEqual(x).validate(y).info.valid === y >= x
    );
    property(
      "lessEqual",
      QC.int.two(),
      ([x, y]) => number.lessEqual(x).validate(y).info.valid === y <= x
    );
    property(
      "less",
      QC.int.two(),
      ([x, y]) => number.less(x).validate(y).info.valid === y < x
    );
  });
});
