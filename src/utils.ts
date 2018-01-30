import * as _ from "lodash";
import { Schema } from "./schemas/any";
import { SchemaResult, SchemaError } from "./types";

export function internalOr<A extends Schema, B extends Schema>(
  schema1: A,
  schema2: B,
  _constructor: any
) {
  const ctor = schema2 instanceof _constructor ? _constructor : Schema;
  return new ctor((obj: any, current: SchemaResult<any>) => {
    const result1 = schema1.validate(obj, { valid: true, obj });
    if (result1.valid) {
      return result1;
    } else {
      const result2 = schema2.validate(obj, { valid: true, obj });
      if (result2.valid) {
        return result2;
      }
      return mergeResults(result1, result2);
    }
  });
}

export function test<A>(
  f: (obj: any, current: SchemaResult<A>) => boolean,
  error?: SchemaError
): (obj: any, current: SchemaResult<A>) => SchemaResult<A> {
  return (obj, current) => {
    if (f(obj, current)) {
      return current;
    } else {
      const errors = error !== undefined ? [error(obj)] : [];
      return {
        valid: false,
        errors: current.valid ? errors : _.concat(current.errors, errors)
      };
    }
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
    return { valid: false, errors: _.concat(result1.errors, result2.errors) };
  }
}
