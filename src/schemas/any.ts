import { SchemaTest } from "../types";
import { BaseSchema } from "./base";
import { valid, invalid } from "../utils";
import { MissingError } from "../errors";

export class AnySchema extends BaseSchema<any> {
  constructor(
    internalValidate: SchemaTest<any> = (obj, path) => {
      return obj !== undefined
        ? valid(obj)
        : invalid(path, new MissingError(obj));
    }
  ) {
    super(internalValidate);
  }
}
