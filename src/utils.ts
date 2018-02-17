import {
  TypeTest,
  ValidationResult,
  InvalidResult,
  ValidResult
} from "./types";
import { ValidationError } from "./errors";

export function valid<A>(obj: any): ValidResult<A> {
  return { valid: true, obj };
}
export function invalid(...errors: ValidationError[]): InvalidResult {
  return { valid: false, errors };
}

export function test<A>(
  resultFunc: (obj: A) => [boolean, () => ValidationError]
): TypeTest<A> {
  return (obj) => {
    const [result, error] = resultFunc(obj);
    return result ? valid<A>(obj) : invalid(error());
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
