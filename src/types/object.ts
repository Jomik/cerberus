import * as equal from "fast-deep-equal";

import { invalid, valid, test, mergeResults } from "../utils";
import { BaseType, Type } from "./base";
import { ValidationResult, TypeConstructor, TypeTest } from "../types";
import {
  TypeError,
  ConstraintError,
  ValidationError,
  MissingError
} from "../errors";

export type ObjectSchema<A extends object> = {
  [k in keyof A]: Type<A[k]> | ((obj: A) => Type<A[k]>)
};

function isReference<A, B extends Type<A>>(
  schema: B | ((obj: any) => B)
): schema is ((obj: any) => B) {
  return typeof schema === "function";
}
function notReference<A, B extends Type<A>>(
  schema: B | ((obj: any) => B)
): schema is B {
  return typeof schema !== "function";
}

function updateObj<A, C>(
  schema: Type<C>,
  result: ValidationResult<A>,
  obj: A,
  key: string
) {
  const res = schema.validate(obj[key]);
  if (!res.valid) {
    res.errors.forEach((e) => e.path.unshift(key));
    if (!result.valid) {
      result.errors = result.errors.concat(res.errors);
    } else {
      return res;
    }
  } else if (result.valid) {
    obj[key] = res.obj;
  }
  return result;
}

export class ObjectType<A extends object> extends BaseType<A> {
  satisfies: (
    predicate: (obj: A) => boolean,
    message: string,
    type: string
  ) => ObjectType<A>;

  constructor(
    validate: TypeTest<any> = test((obj) => [
      obj === undefined || (typeof obj === "object" && !Array.isArray(obj)),
      () => new TypeError(obj, "object")
    ]),
    private schema: ObjectSchema<A>
  ) {
    super(validate);
  }

  /**
   * Validate object against schema
   * @param obj The object to validate
   */
  validate(object: any): ValidationResult<A> {
    let result = this.internalValidate(object);
    if (!result.valid) {
      return result;
    }

    if (
      (object === undefined || object === null) &&
      Object.keys(this.schema).length === 0
    ) {
      return invalid(new TypeError(object, "object"));
    }
    const obj = Object.assign({}, object);
    result.obj = obj;

    for (const key in this.schema) {
      /* istanbul ignore else */
      if (this.schema.hasOwnProperty(key)) {
        const schema = this.schema[key];
        if (notReference<A[keyof A], Type<A[keyof A]>>(schema)) {
          result = updateObj<A, A[keyof A]>(schema, result, obj, key);
        }
      }
    }

    if (result.valid) {
      for (const key in this.schema) {
        /* istanbul ignore else */
        if (this.schema.hasOwnProperty(key)) {
          const schemaFunc = this.schema[key];
          if (isReference<A[keyof A], Type<A[keyof A]>>(schemaFunc)) {
            const schema = schemaFunc(obj);
            result = updateObj<A, A[keyof A]>(schema, result, obj, key);
          }
        }
      }
    }
    return result;
  }

  extend<B extends object>(specification: ObjectSchema<B>): ObjectType<A & B> {
    const mergedSpec = Object.assign(
      {},
      this.schema,
      specification
    ) as ObjectSchema<A & B>;

    return new ObjectType<A & B>(this.internalValidate, mergedSpec);
  }

  strict(): BaseType<A> {
    return this.chain<BaseType<A>>((obj) => {
      const additional = Object.keys(obj).filter(
        (e) => this.schema[e] === undefined
      );
      if (additional.length === 0) {
        return valid(obj);
      } else {
        return invalid(
          new ConstraintError(
            obj,
            `not have properties ${additional}`,
            "strict",
            Object.keys(this.schema)
          )
        );
      }
    }, BaseType);
  }
}
