import { SchemaResult, SchemaTest } from "../types";
import { Schema } from "./schema";
import { valid, invalid, error } from "../utils";
import { oneOf } from "../functions";

export class AnySchema extends Schema<any> {
  constructor(
    validate: SchemaTest<any> = (obj) => {
      return obj !== undefined ? valid(obj) : invalid(error`is undefined`);
    }
  ) {
    super(validate);
  }
  oneOf = oneOf;
}
