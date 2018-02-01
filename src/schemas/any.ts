import { SchemaTest } from "../types";
import { Schema } from "./schema";
import { valid, invalid } from "../utils";
import { oneOf } from "../functions";
import { MissingError } from "../errors";

export class AnySchema extends Schema<any> {
  constructor(
    validate: SchemaTest<any> = (obj, path) => {
      return obj !== undefined
        ? valid(obj)
        : invalid(path, new MissingError(obj));
    }
  ) {
    super(validate);
  }
}
