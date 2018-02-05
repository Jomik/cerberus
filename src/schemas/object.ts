import { invalid, valid, test } from "../utils";
import { Schema } from "./base";
import { ValidationResult, SchemaConstructor, SchemaTest } from "../types";
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
  constructor(
    internalValidate: SchemaTest<A> = test((obj) => [
      obj === undefined || (typeof obj === "object" && !Array.isArray(obj)),
      () => new TypeError(obj, "object")
    ])
  ) {
    super(internalValidate);
  }

  extend<B extends object>(
    specification: ObjectSpecification<B>
  ): ObjectSchema<A & B> {
    return this.chain<ObjectSchema<A & B>>(
      (testObj, path) => {
        if (
          (testObj === undefined || testObj === null) &&
          Object.keys(specification).length === 0
        ) {
          return invalid(testObj, new TypeError(testObj, "object"));
        }
        const obj = Object.assign({}, testObj);
        let result: ValidationResult<A> = {
          valid: true,
          obj
        };

        function updateObj<C>(schema: Schema<C>, key: string, p?: string) {
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

        for (const key in specification) {
          /* istanbul ignore else */
          if (specification.hasOwnProperty(key)) {
            const schema = specification[key];
            if (notReference<B[keyof B], Schema<B[keyof B]>>(schema)) {
              updateObj(schema, key, path);
            }
          }
        }

        for (const key in specification) {
          /* istanbul ignore else */
          if (specification.hasOwnProperty(key)) {
            const schemaFunc = specification[key];
            if (isReference<B[keyof B], Schema<B[keyof B]>>(schemaFunc)) {
              const schema = schemaFunc(obj);
              updateObj(schema, key, path);
            }
          }
        }

        return result;
      },
      ObjectSchema as SchemaConstructor<A & B, ObjectSchema<A & B>>
    );
  }
}
