import { test, error } from "../utils";
import { Schema } from "./schema";
import { SchemaTest } from "../types";

export class NumberSchema<A extends number> extends Schema<A> {
  constructor(
    validate: SchemaTest<A> = test(
      (obj) => typeof obj === "number",
      error`is not a number`
    )
  ) {
    super(validate);
  }
}
