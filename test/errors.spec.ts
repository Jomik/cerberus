import "mocha";
import { expect } from "chai";
import {
  ValidationError,
  ValueError,
  ConstraintError,
  MissingError,
  AlternativesError
} from "../src/errors";
// tslint:disable:no-unused-expression

describe("errors", () => {
  describe("ValidationError", () => {
    let obj;
    let error;
    beforeEach(() => {
      obj = { a: "foo", b: "bar" };
      error = new ValidationError(obj, 'must be "foo"');
    });
    it("defaults to not fatal", () => {
      expect(error.fatal).to.be.false;
    });
    it("saves obj", () => {
      expect(error.obj).to.equal(obj);
    });
    it("has correct name", () => {
      expect(error.name).to.equal("ValidationError");
    });
    describe("toString", () => {
      it("is a string", () => {
        expect(error.toString()).to.be.a("string");
      });
      it("stringifies object", () => {
        expect(error.toString()).to.include("<object>");
      });
      it("stringifies array", () => {
        expect(
          new ValidationError(["foo", "bar", "baz"], "").toString()
        ).to.include("<array>");
      });
      it("shows string", () => {
        expect(new ValidationError("foo", "").toString()).to.include('"foo"');
      });
      it("shows number", () => {
        expect(new ValidationError(3, "").toString()).to.include("3");
      });
      it("shows path", () => {
        error.path = ["a", "b"];
        expect(error.toString()).to.include("a.b");
      });
      it("shows index", () => {
        error.path = [1, 2];
        expect(error.toString()).to.include("[1][2]");
      });
      it("shows path and index", () => {
        error.path = ["a", 1, "b", 2];
        expect(error.toString()).to.include("a[1].b[2]");
      });
      it("shows suffix", () => {
        expect(new ValidationError("foo", "", ".length").toString()).to.include(
          ".length"
        );
      });
      it("shows source", () => {
        error.path = ["a", 1, "b", 2];
        expect(error.toString("bar")).to.include("bar");
      });
    });
  });
  describe("MissingError", () => {
    it("to string", () => {
      const error = new MissingError("foo");
      expect(error.toString()).to.include("be defined");
    });
    it("to string with path", () => {
      const error = new MissingError("foo");
      error.path = ["a", 1];
      expect(error.toString()).to.include(".a[1]");
    });
    it("shows source", () => {
      const error = new MissingError("foo");
      expect(error.toString("bar")).to.include("bar");
    });
    it("shows source with path", () => {
      const error = new MissingError("foo");
      error.path = ["a", 1];
      expect(error.toString("bar")).to.include("bar.a[1]");
    });
  });
  describe("ConstraintError", () => {
    it("has correct name", () => {
      const error = new ConstraintError("foo", "greater than 4", "gt", 4);
      expect(error.name).to.equal("ConstraintError");
    });
    it("shows constraint", () => {
      const error = new ConstraintError("foo", "greater than 4", "gt", 4);
      expect(error.toString()).to.include("greater than 4");
    });
    it("shows property", () => {
      const error = new ConstraintError(
        "foo",
        "greater than 4",
        "gt",
        4,
        "length"
      );
      expect(error.toString()).to.include(".length");
    });
  });
  describe("ValueError", () => {
    it("has correct name", () => {
      const error = new ValueError("foo", ["bar", "baz"]);
      expect(error.name).to.equal("ValueError");
    });
    it("shows values", () => {
      const error = new ValueError("foo", ["bar", "baz"]);
      expect(error.toString())
        .to.include("bar")
        .to.include("baz");
    });
    it("shows value", () => {
      const error = new ValueError("foo", ["bar"]);
      expect(error.toString()).to.include("bar");
    });
  });
  describe("AlternativesError", () => {
    const first = [new ValidationError("foo", "bar")];
    const second = [
      new ValidationError("foo", "baz"),
      new ValidationError("foo", "buz")
    ];
    const error = new AlternativesError("foo", [first, second]);
    it("includes child", () => {
      error.toString().includes(first[0].toString());
    });
    it("includes multiple and path", () => {
      error.path = ["a"];
      error.toString().includes(".a");
      error.toString().includes(second[0].toString());
      error.toString().includes(second[1].toString());
    });
  });
});
