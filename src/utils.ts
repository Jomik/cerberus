import {
  SchemaTest,
  ValidationResult,
  InvalidResult,
  ValidResult
} from "./types";
import { ValidationError } from "./errors";

export function valid<A>(obj: any): ValidResult<A> {
  return { valid: true, obj };
}
export function invalid(
  path?: string,
  ...errors: ValidationError[]
): InvalidResult {
  if (path !== undefined) {
    errors.forEach((e) => e.path.push(path));
  }
  return { valid: false, errors };
}

export function test<A>(
  predicate: (obj: A) => boolean,
  ...errors: ([new (obj: any, payload: any) => ValidationError, any])[]
): SchemaTest<A> {
  return (obj, path) => {
    return predicate(obj)
      ? valid<A>(obj)
      : invalid(
          path,
          ...errors.map(([ctor, payload]) => new ctor(obj, payload))
        );
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

export function stringify(obj: any) {
  if (obj !== null && typeof obj === "object") {
    return Array.isArray(obj) ? "<array>" : "<object>";
  }
  return JSON.stringify(obj);
}
