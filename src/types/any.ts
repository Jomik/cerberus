import { TypeTest } from "../types";
import { BaseType } from "./base";
import { valid, invalid } from "../utils";
import { MissingError } from "../errors";

export class AnyType extends BaseType<any> {
  constructor(
    validate: TypeTest<any> = (obj) => {
      return obj !== undefined ? valid(obj) : invalid(new MissingError(obj));
    }
  ) {
    super(validate);
  }
}
