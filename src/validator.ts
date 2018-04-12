import { Result, valid, invalid } from "./result";
import {
  ValidationError,
  error,
  typeError,
  objectError,
  propertyError,
  arrayError
} from "./errors";
import { Id } from "./types";
import { or, xor, and } from "./functions";
import { ALPHANUM } from "./utils";
// tslint:disable:variable-name

export type SchemaEntry<A extends object, B> =
  | Validator<B>
  | ((obj: A) => Validator<B>);
export type Schema<A extends object> = { [K in keyof A]: SchemaEntry<A, A[K]> };

export class Validator<A> {
  constructor(protected _validate: (obj: A) => Result<A>) {}

  validate(value: any): Result<A> {
    return this._validate(value);
  }

  test(value: any): A {
    return this._validate(value).match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }
}

export function validator<A>(v: (object: A) => Result<A>) {
  return new Validator<A>(v);
}

export class TypeValidator<A> extends Validator<A> {
  constructor(_validate: (obj: A) => Result<A>) {
    super(_validate);
  }

  optional(): Validator<A | undefined> {
    return validator((o) => (o === undefined ? valid(o) : this.validate(o)));
  }

  default(d: A): Validator<A> {
    return validator((o) => (o === undefined ? valid(d) : this.validate(o)));
  }

  or<B>(right: TypeValidator<B>): TypeValidator<A | B> {
    return or(this, right);
  }

  and<B extends object>(
    this: TypeValidator<object>,
    right: TypeValidator<B>
  ): TypeValidator<Id<A & B>>;
  and<B>(right: TypeValidator<B>): TypeValidator<A & B>;
  and<B>(right: TypeValidator<B>) {
    return and(this, right);
  }

  xor<B>(right: TypeValidator<B>): TypeValidator<A | B> {
    return xor(this, right);
  }

  satisfy(
    c: (obj: A) => boolean,
    err: ValidationError = error("no description")
  ): TypeValidator<A> {
    return typeValidator((o) =>
      this.validate(o).chain<A>((obj) => (c(obj) ? valid(obj) : invalid(err)))
    );
  }

  map<B>(f: (obj: A) => B): TypeValidator<B> {
    return typeValidator<B>((o) =>
      this.validate(o).match<Result<B>>({
        valid: (a) => valid(f(a)),
        invalid: (err) => invalid(err)
      })
    );
  }

  // Shared validations
  length(
    this: TypeValidator<string>,
    f: (v: TypeValidator<number>) => TypeValidator<any>
  ): TypeValidator<A>;
  length(
    this: TypeValidator<any[]>,
    f: (v: TypeValidator<number>) => TypeValidator<any>
  ): TypeValidator<A>;
  length(
    this: TypeValidator<any>,
    f: (v: TypeValidator<number>) => TypeValidator<any>
  ): TypeValidator<A> {
    return typeValidator((o) =>
      this.validate(o)
        .chain((a) => f(anyType).validate(a.length))
        .match<Result<A>>({
          valid: () => valid(o),
          invalid: (err) => invalid(propertyError("length", err))
        })
    );
  }

  includes<B>(this: TypeValidator<B[]>, str: B): TypeValidator<A>;
  includes(this: TypeValidator<string>, str: string): TypeValidator<A>;
  includes(this: TypeValidator<any>, str: any): TypeValidator<A> {
    return this.satisfy((s) => s.includes(str), error(`must include ${str}`));
  }

  // String validations
  matches(this: TypeValidator<string>, exp: RegExp): TypeValidator<string> {
    return this.satisfy((s) => exp.test(s), error(`must match ${exp.source}`));
  }

  alphanum(this: TypeValidator<string>): TypeValidator<string> {
    return this.satisfy(
      (s) => ALPHANUM.test(s),
      error("must only contain alphahumeric characters")
    );
  }

  // Number validations
  integer(this: TypeValidator<number>): TypeValidator<number> {
    return this.satisfy(
      (i) => Number.isInteger(i),
      error("must be an integer")
    );
  }

  multiple(this: TypeValidator<number>, n: number): TypeValidator<number> {
    return this.satisfy(
      (i) => Number.isInteger(i / n),
      error(`must be a multiple of ${n}`)
    );
  }

  positive(this: TypeValidator<number>): TypeValidator<number> {
    return this.gt(0);
  }

  negative(this: TypeValidator<number>): TypeValidator<number> {
    return this.lt(0);
  }

  gt(this: TypeValidator<number>, n: number): TypeValidator<number> {
    return this.satisfy((i) => i > n, error(`must be greater than ${n}`));
  }

  ge(this: TypeValidator<number>, n: number): TypeValidator<number> {
    return this.satisfy(
      (i) => i >= n,
      error(`must be greater than or equal to ${n}`)
    );
  }

  equal(this: TypeValidator<number>, n: number): TypeValidator<number> {
    return this.satisfy((i) => i === n, error(`must be equal to ${n}`));
  }

  le(this: TypeValidator<number>, n: number): TypeValidator<number> {
    return this.satisfy(
      (i) => i <= n,
      error(`must be less than or equal to ${n}`)
    );
  }

  lt(this: TypeValidator<number>, n: number): TypeValidator<number> {
    return this.satisfy((i) => i < n, error(`must be less than ${n}`));
  }

  between(
    this: TypeValidator<number>,
    l: number,
    h: number
  ): TypeValidator<number> {
    return this.satisfy(
      (i) => i > l && i < h,
      error(`must be between ${l} and ${h}`)
    );
  }
}

export function typeValidator<A>(v: (object: A) => Result<A>) {
  return new TypeValidator<A>(v);
}

export const number = typeValidator<number>(
  (o: any) =>
    typeof o === "number" ? valid(o) : invalid(typeError("must be a number"))
);
export const integer = number.integer();

export const string = typeValidator<string>(
  (o: any) =>
    typeof o === "string" ? valid(o) : invalid(typeError("must be a string"))
);

export const boolean = typeValidator<boolean>(
  (o: any) =>
    typeof o === "boolean" ? valid(o) : invalid(typeError("must be a boolean"))
);

export const required = typeValidator<any>(
  (o: any) =>
    o !== undefined && o !== null
      ? valid(o)
      : invalid(typeError("must be defined"))
);

export const forbidden = typeValidator<undefined>(
  (o: any) =>
    o === undefined ? valid(o) : invalid(typeError("must be undefined"))
);

export const nil = typeValidator<null>(
  (o: any) => (o === null ? valid(o) : invalid(typeError("must be null")))
);

export const any = typeValidator<any>(valid);
const anyType = typeValidator<any>(valid);

function objectValidator<A extends object, B>(
  schema: Schema<A>,
  options: { rest: SchemaEntry<A, B> }
): TypeValidator<Id<A & { [index: string]: B }>>;
function objectValidator<A extends object, B>(
  schema: Schema<A>,
  options: { strict: boolean }
): TypeValidator<A>;
function objectValidator<A extends object, B>(
  schema: Schema<A>
): TypeValidator<A>;

function objectValidator<A extends object, B>(
  schema: Schema<A>,
  options: { rest?: SchemaEntry<A, B>; strict?: boolean } = { strict: false }
): TypeValidator<A> {
  const schemaEntries: [
    keyof A,
    SchemaEntry<A, A[keyof A]>,
    number
  ][] = <any>Object.entries(schema);
  schemaEntries.reduce((acc, arr) => arr.push(++acc), -1);
  schemaEntries.sort((a, b) => {
    const aFunc = typeof a[1] === "function";
    const bFunc = typeof b[1] === "function";
    if ((aFunc && bFunc) || (!aFunc && !bFunc)) {
      return a[2] - b[2];
    } else if (aFunc && !bFunc) {
      return 1;
    } else {
      return -1;
    }
  });

  return typeValidator((o: any) => {
    if (typeof o === "object" && !Array.isArray(o)) {
      const keys = new Set(Object.keys(o));
      let obj: A & { [index: string]: B } = <any>{};
      let err: [string, ValidationError][] = [];
      let errored = false;

      for (const [k, v] of schemaEntries) {
        if (typeof v !== "function") {
          v.validate(o[k]).match({
            valid: (val) => {
              obj[k] = val;
            },
            invalid: (e) => {
              err.push([k, e]);
              errored = true;
            }
          });
        } else if (!errored) {
          v(obj)
            .validate(o[k])
            .match({
              valid: (val) => {
                obj[k] = val;
              },
              invalid: (e) => {
                err.push([k, e]);
                errored = true;
              }
            });
        } else {
          return invalid(objectError(err));
        }
        keys.delete(k);
      }

      if (errored) {
        return invalid(objectError(err));
      }

      if (options.rest !== undefined) {
        const v =
          typeof options.rest === "function" ? options.rest(obj) : options.rest;
        for (const k of keys) {
          v.validate(o[k]).match({
            valid: (val) => {
              obj[k] = val;
            },
            invalid: (e) => {
              err.push([k, e]);
              errored = true;
            }
          });
        }
      } else if (options.strict) {
        if (keys.size > 0) {
          return invalid(
            error(`unknown key(s): ${Array.from(keys).join(", ")}`)
          );
        }
      } else {
        for (const k of keys) {
          obj[k] = o[k];
        }
      }

      return !errored ? valid(obj) : invalid(objectError(err));
    }
    return invalid(typeError("must be an object"));
  });
}
export const object = objectValidator;

function arrayValidator<A>(v: Validator<A>): TypeValidator<A[]> {
  return typeValidator((o: any) => {
    if (Array.isArray(o)) {
      let errored = false;
      let err: [number, ValidationError][] = [];
      const res = o.map((entry, i) =>
        v.validate(entry).match({
          valid: (a) => a,
          invalid: (e) => {
            err.push([i, e]);
            errored = true;
            return undefined;
          }
        })
      );
      return !errored ? valid(res) : invalid(arrayError(err));
    }
    return invalid(typeError("must be an array"));
  });
}
export const array = arrayValidator;
