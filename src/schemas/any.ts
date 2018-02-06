import { SchemaTest } from "../types";
import { BaseSchema } from "./base";
import { valid, invalid } from "../utils";
import { MissingError } from "../errors";

export class AnySchema extends BaseSchema<any> {
  constructor(
    internalValidate: SchemaTest<any> = (obj) => {
      return obj !== undefined ? valid(obj) : invalid(new MissingError(obj));
    }
  ) {
    super(internalValidate);
  }
}
