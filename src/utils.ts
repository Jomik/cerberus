import {
  SchemaError,
  SchemaTest,
  ValidationResult,
  InvalidResult
} from "./types";
import { Schema } from "./schemas/schema";
import { ValidResult } from "./types";

export function valid<A>(obj: any): ValidResult<A> {
  return { valid: true, obj };
}
export function invalid(path: string, ...errors: SchemaError[]): InvalidResult {
  return { valid: false, errors: errors.map((e) => e(path)) };
}

export function error<A>(strings: TemplateStringsArray, ...keys: any[]) {
  const result = keys.reduce(
    (acc, val, index) => `${acc}${strings[index + 1]}${val}`,
    strings[0]
  );
  return (element) => `${element} ${result}`;
}

export function test<A>(
  predicate: (obj: any) => boolean,
  ...errors: SchemaError[]
): SchemaTest<A> {
  return (obj, path) => {
    return predicate(obj)
      ? valid<A>(obj)
      : invalid(`${path}.${obj}`, ...errors);
  };
}

export function mergeResults<A>(
  result1: ValidationResult<A>,
  result2: ValidationResult<A>
): ValidationResult<A> {
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
