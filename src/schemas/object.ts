import { invalid, valid, test, mergeResults } from "../utils";
import { BaseSchema, Schema } from "./base";
import { ValidationResult, SchemaConstructor, SchemaTest } from "../types";
import {
  TypeError,
  ConstraintError,
  ValidationError,
  MissingError
} from "../errors";
import * as equal from "fast-deep-equal";

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

function updateObj<A, C>(
  schema: Schema<C>,
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

export class ObjectSchema<A extends object> extends BaseSchema<A> {
  constructor(
    internalValidate: SchemaTest<any> = test((obj) => [
      obj === undefined || (typeof obj === "object" && !Array.isArray(obj)),
      () => new TypeError(obj, "object")
    ]),
    private specification: ObjectSpecification<A>
  ) {
    super(internalValidate);
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
      Object.keys(this.specification).length === 0
    ) {
      return invalid(new TypeError(object, "object"));
    }
    const obj = Object.assign({}, object);
    result.obj = obj;

    for (const key in this.specification) {
      /* istanbul ignore else */
      if (this.specification.hasOwnProperty(key)) {
        const schema = this.specification[key];
        if (notReference<A[keyof A], Schema<A[keyof A]>>(schema)) {
          result = updateObj<A, A[keyof A]>(schema, result, obj, key);
        }
      }
    }
    for (const key in this.specification) {
      /* istanbul ignore else */
      if (this.specification.hasOwnProperty(key)) {
        const schemaFunc = this.specification[key];
        if (isReference<A[keyof A], Schema<A[keyof A]>>(schemaFunc)) {
          const schema = schemaFunc(obj);
          result = updateObj<A, A[keyof A]>(schema, result, obj, key);
        }
      }
    }
    return result;
  }

  merge<B extends object>(
    specification: ObjectSpecification<B>
  ): ObjectSchema<A & B> {
    const mergedSpec = Object.assign(
      {},
      this.specification,
      specification
    ) as ObjectSpecification<A & B>;

    return new ObjectSchema<A & B>(this.internalValidate, mergedSpec);
  }

  strict(): BaseSchema<A> {
    return this.chain<BaseSchema<A>>((obj) => {
      const additional = Object.keys(obj).filter(
        (e) => this.specification[e] === undefined
      );
      if (additional.length === 0) {
        return valid(obj);
      } else {
        return invalid(
          new ConstraintError(obj, `not have properties ${additional}`)
        );
      }
    }, BaseSchema);
  }
}
