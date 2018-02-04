import { invalid, valid } from "../utils";
import { Schema } from "./base";
import { ValidationResult } from "../types";
import { TypeError } from "../errors";

export type ObjectSpecification<A extends object> = {
  [k in keyof A]: Schema<A[k]> | ((obj: A) => Schema<A[k]>)
};

export class ObjectSchema<A extends object> extends Schema<A> {
  constructor(spec: ObjectSpecification<A>) {
    super((testObj, path) => {
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

        function updateObj(schema: ObjectSchema<A>, key: string, p?: string) {
          const res = schema.internalValidate(obj[key], key);
          if (!res.valid) {
            if (p !== undefined) {
              res.errors.forEach((e) => e.path.unshift(p));
            }
            if (!result.valid) {
              result.errors = result.errors.concat(res.errors);
            } else {
              result = res;
            }
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
      } else if (testObj === undefined && Object.keys(spec).length > 0) {
        const result = this.internalValidate({} as any, path);
        if (result.valid) {
          return result;
        }
      }
      return invalid(path, new TypeError(testObj, "object"));
    });
  }
}
