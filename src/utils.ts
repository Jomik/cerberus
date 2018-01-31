import {
  SchemaResult,
  SchemaError,
  SchemaTest,
  InvalidSchemaResult,
  ValidSchemaResult
} from "./types";
import { Schema } from "./schemas/schema";

export function valid<A>(obj: any): ValidSchemaResult<A> {
  return { valid: true, obj };
}

export function invalid(...errors: SchemaError[]): InvalidSchemaResult {
  return { valid: false, errors };
}

export function error<A>(strings: TemplateStringsArray, ...keys: any[]) {
  const result = keys.reduce(
    (acc, val, index) => `${acc}${strings[index + 1]}${val}`,
    strings[0]
  );
  return (element) => `${element} ${result}`;
}

export function path(key: string, e: (element: any) => string) {
  return (element) => `${element}.${e(key)}`;
}

export function test<A>(
  predicate: (obj: any) => boolean,
  ...errors: SchemaError[]
): SchemaTest<A> {
  return (obj) => {
    return predicate(obj) ? valid<A>(obj) : invalid(...errors);
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
      errors: result1.errors.concat(result2.errors)
    };
  }
}
