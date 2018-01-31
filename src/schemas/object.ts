import { test, mergeResults, invalid, error, path } from "../utils";
import { SchemaResult } from "../types";
import { Schema } from "./schema";

export type ObjectSpecification<A extends object> = {
  [k in keyof A]: Schema<A[k]>
};

export class ObjectSchema<A extends object> extends Schema<A> {
  constructor(spec: ObjectSpecification<A>) {
    super((obj) => {
      if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
        let result: SchemaResult<A> = {
          valid: true,
          obj: Object.assign({}, obj)
        };
        for (const key in spec) {
          if (spec.hasOwnProperty(key)) {
            const element = obj[key];
            const res = spec[key].validate(element);
            if (!res.valid) {
              const errors = res.errors.map((e) => path(key, e));
              result = invalid(
                ...(result.valid ? errors : result.errors.concat(errors))
              );
            } else if (result.valid) {
              result.obj[key] = res.obj;
            }
          }
        }
        return result;
      } else {
        return invalid(error`is not an object`);
      }
    });
  }
}
