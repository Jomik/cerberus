import { test } from "../utils";
import { SchemaResult, SchemaTest } from "../types";
import { Schema } from "./schema";

export class AnySchema<A = any> extends Schema<A> {
  constructor(
    validate: SchemaTest<any, A> = test(
      (obj) => obj !== undefined,
      (obj) => `${obj} can not be undefined`
    )
  ) {
    super(validate);
  }
}
