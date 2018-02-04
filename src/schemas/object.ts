import { invalid, valid } from "../utils";
import { Schema } from "./base";
import { ValidationResult } from "../types";
import { TypeError } from "../errors";

export type ObjectSpecification<A extends object> = {
  [k in keyof A]: Schema<A[k]> | ((obj: A) => Schema<A[k]>)
};

function isReference<A, B extends Schema<A>>(
  schema: B | ((obj: any) => B)
): schema is ((obj: any) => B) {
  return typeof schema === "function";
}
function notReference<A, B extends Schema<A>>(
  schema: B | ((obj: any) => B)
): schema is B {
  return typeof schema !== "function";
}

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

        function updateObj<B>(schema: Schema<B>, key: string, p?: string) {
          const res = (schema as any).internalValidate(obj[key], key);
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
          /* istanbul ignore else */
          if (spec.hasOwnProperty(key)) {
            const schema = spec[key];
            if (notReference<A[keyof A], Schema<A[keyof A]>>(schema)) {
              updateObj(schema, key, path);
            }
          }
        }

        for (const key in spec) {
          /* istanbul ignore else */
          if (spec.hasOwnProperty(key)) {
            const schemaFunc = spec[key];
            if (isReference<A[keyof A], Schema<A[keyof A]>>(schemaFunc)) {
              const schema = schemaFunc(obj);
              updateObj(schema, key, path);
            }
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
