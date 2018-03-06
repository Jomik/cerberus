import "mocha";
import { expect } from "chai";
import { InvalidResult, ValidResult } from "../src/types";
import { validate, date } from "../src/index";
import { NumericProperty } from "../src/constraints/property";
// tslint:disable:no-unused-expression

describe("date", () => {
  describe("accepts", () => {
    it("new Date", () => {
      expect(date.validate(new Date()).valid).to.be.true;
    });
    it("ISO string", () => {
      expect(date.validate("2018-03-06T13:49:06.320Z").valid).to.be.true;
    });
  });
  describe("rejects", () => {
    it("<undefined>", () => {
      expect(date.validate(undefined).valid).to.be.false;
    });
    it("<string>", () => {
      expect(date.validate("foo").valid).to.be.false;
    })
    it("<number>", () => {
      expect(date.validate(42).valid).to.be.false;
    });
  });
  describe("properties", () => {
    it("year", () => {
      expect(date.year).to.be.an.instanceof(NumericProperty);
    })
    it("month", () => {
      expect(date.month).to.be.an.instanceof(NumericProperty);
    })
    it("date", () => {
      expect(date.date).to.be.an.instanceof(NumericProperty);
    })
    it("day", () => {
      expect(date.day).to.be.an.instanceof(NumericProperty);
    })
    it("hours", () => {
      expect(date.hours).to.be.an.instanceof(NumericProperty);
    })
    it("minutes", () => {
      expect(date.minutes).to.be.an.instanceof(NumericProperty);
    })
    it("seconds", () => {
      expect(date.seconds).to.be.an.instanceof(NumericProperty);
    })
    it("milliseconds", () => {
      expect(date.milliseconds).to.be.an.instanceof(NumericProperty);
    })
    it("time", () => {
      expect(date.time).to.be.an.instanceof(NumericProperty);
    })
  })
});
