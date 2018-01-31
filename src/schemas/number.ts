import { test } from "../utils";
import { AnySchema } from "./any";
import { SchemaTest } from "../types";

export class NumberSchema<A extends number> extends AnySchema<A> {
  constructor(
    validate: SchemaTest<any, A> = test(
      (obj) => typeof obj === "number",
      (obj) => `${obj} is not a number`
    )
  ) {
    super(validate);
  }
}
