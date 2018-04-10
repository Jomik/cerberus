import "mocha";
import { expect } from "chai";
import { object, number, string, any } from "../src";
import { ValidationObjectError } from "../src/error";

describe("object", () => {
  describe("accepts", () => {
    it("objects", () => {
      const schema = object({
        a: string
      });
      const { result } = schema.validate({
        a: 22
      });
      if (result.valid) {
        console.log(result.object);
      } else {
        const { error } = result;
        if (error instanceof ValidationObjectError) {
          console.log(error.details());
        } else {
          console.log(error.message);
        }
      }
    });
  });
});
