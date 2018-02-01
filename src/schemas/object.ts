import { test, mergeResults, invalid, error } from "../utils";
import { Schema } from "./schema";
import { ValidationResult } from "../types";

export type ObjectSpecification<A extends object> = {
  [k in keyof A]: Schema<A[k]>
};

export class ObjectSchema<A extends object> extends Schema<A> {
  constructor(spec: ObjectSpecification<A>) {
    super(function(obj, path) {
      if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
        let result: ValidationResult<A> = {
          valid: true,
          obj: Object.assign({}, obj)
        };
        for (const key in spec) {
          if (spec.hasOwnProperty(key)) {
            const element = obj[key];
            const res = (spec[key] as ObjectSchema<A>).internalValidate(
              element,
              `${path}.${key}`
            );
            if (!res.valid) {
              result = {
                valid: false,
                errors: result.valid
                  ? res.errors
                  : result.errors.concat(res.errors)
              };
            } else if (result.valid) {
              result.obj[key] = res.obj;
            }
          }
        }
        return result;
      } else {
        return invalid(path, error`is not an object`);
      }
    });
  }
}
