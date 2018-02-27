import { TypeTest } from "../types";
import { BaseType } from "./base";
import { valid, invalid } from "../utils";
import { MissingError } from "../errors";
import { StringType } from "./string";
import { NumberType } from "./number";
import { BooleanType } from "./boolean";
import { ArrayType } from "./array";
import { ObjectSchema, ObjectType } from "./object";

export class AnyType extends BaseType<any> {
  satisfies: (
    predicate: (obj: any) => boolean,
    message: string,
    type: string
  ) => AnyType;

  constructor(
    validate: TypeTest<any> = (obj) => {
      return obj !== undefined ? valid(obj) : invalid(new MissingError(obj));
    }
  ) {
    super(validate);
  }
}
