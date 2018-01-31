import * as _ from "lodash";
import { AnySchema } from "./schemas/any";
import { StringSchema } from "./schemas/string";
import { NumberSchema } from "./schemas/number";
import { test } from "./utils";
import { ObjectSchema, ObjectSpecification } from "./schemas/object";
import { SchemaResult } from "./types";
import { Schema } from "./schemas/schema";
import { oneOf } from "./functions";
export * from "./functions";

// tslint:disable-next-line:no-shadowed-variable
export function validate<A>(
  schema: Schema<A>,
  obj: any,
  name?: string
): SchemaResult<A> {
  let result;
  try {
    result = schema.validate(obj);
  } catch (res) {
    result = res;
  }
  if (!result.valid) {
    const errors = _.map(result.errors, (e) => e(name || result.obj));
    return {
      valid: false,
      obj: result.obj,
      errors: errors
    };
  }
  return result;
}

export const any = new AnySchema();
export const string = new StringSchema();
export const number = new NumberSchema();
export function object<A extends object>(
  specification: ObjectSpecification<A>
) {
  return new ObjectSchema(specification);
}
