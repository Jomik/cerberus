import { test, mergeResults, invalid, error } from "../utils";
import { Schema } from "./schema";
import { ValidationResult } from "../types";

export type ObjectSpecification<A extends object> = {
  [k in keyof A]: Schema<A[k]> | ((obj: A[k]) => Schema<A[k]>)
};

export class ObjectSchema<A extends object> extends Schema<A> {
  constructor(spec: ObjectSpecification<A>) {
    super(function(testObj, path) {
      if (
        testObj !== null &&
        typeof testObj === "object" &&
        !Array.isArray(testObj)
      ) {
        const obj = Object.assign({}, testObj);
        let result: ValidationResult<A> = {
          valid: true,
          obj
        };

        function updateObj(schema: ObjectSchema<A>, key, p) {
          const res = schema.internalValidate(obj[key], `${p}.${key}`);
          if (!res.valid) {
            result = {
              valid: false,
              errors: result.valid
                ? res.errors
                : result.errors.concat(res.errors)
            };
          } else if (result.valid) {
            obj[key] = res.obj;
          }
        }
        for (const key in spec) {
          if (spec.hasOwnProperty(key) && typeof spec[key] !== "function") {
            const schema = spec[key] as ObjectSchema<A>;
            updateObj(schema, key, path);
          }
        }

        for (const key in spec) {
          if (spec.hasOwnProperty(key) && typeof spec[key] === "function") {
            const schema = (spec[key] as (o) => ObjectSchema<A>)(obj);
            updateObj(schema, key, path);
          }
        }

        return result;
      } else {
        return invalid(path, error`is not an object`);
      }
    });
  }
}
