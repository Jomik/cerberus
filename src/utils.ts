import * as _ from "lodash";
import { SchemaResult, SchemaError, SchemaTest } from "./types";
import { Schema } from "./schemas/schema";

export function test<A extends B, B>(
  f: (obj: A) => boolean,
  error?: SchemaError<A>,
  schema?: Schema<A>
): SchemaTest<A, B> {
  return (obj) => {
    const prev: SchemaResult<A> =
      schema !== undefined ? schema.validate(obj) : { valid: true, obj };
    const curr: SchemaResult<B> = f(prev.obj)
      ? { valid: true, obj: prev.obj }
      : {
          valid: false,
          obj: prev.obj,
          errors: error !== undefined ? [error] : []
        };
    if (schema === undefined && !curr.valid) {
      throw curr;
    }
    return mergeResults(prev, curr);
  };
}

export function mergeResults<A>(
  result1: SchemaResult<A>,
  result2: SchemaResult<A>
): SchemaResult<A> {
  if (result1.valid) {
    return result2;
  } else if (result2.valid) {
    return result1;
  } else {
    return {
      valid: false,
      obj: result2.obj,
      errors: _.concat(result1.errors, result2.errors)
    };
  }
}
