import { Result, valid, invalid } from "./result";
import {
  typeError,
  error,
  ValidationError,
  arrayError,
  objectError
} from "./errors";
import { Id } from "./types";
import { Validator } from "./validator";
// tslint:disable:variable-name

export class NumberValidator extends Validator<number> {
  validate(value: any) {
    return typeof value === "number"
      ? valid(value)
      : invalid<number>(typeError("must be a number"));
  }
}
export const number: Validator<number> = new NumberValidator();

export class IntegerValidator extends Validator<number> {
  validate(value: number) {
    return Number.isInteger(value)
      ? valid(value)
      : invalid<number>(error("must be an integer"));
  }
}
export const integer: Validator<number> = new IntegerValidator();

export class StringValidator extends Validator<string> {
  validate(value: any) {
    return typeof value === "string"
      ? valid(value)
      : invalid<string>(typeError("must be a string"));
  }
}
export const string: Validator<string> = new StringValidator();

export class BooleanValidator extends Validator<boolean> {
  validate(value: any) {
    return typeof value === "boolean"
      ? valid(value)
      : invalid<boolean>(typeError("must be a boolean"));
  }
}
export const boolean: Validator<boolean> = new BooleanValidator();

export class DefinedValidator extends Validator<any> {
  validate(value: any) {
    return value !== undefined && value !== null
      ? valid(value)
      : invalid(typeError("must be defined"));
  }
}
export const required = new DefinedValidator();

export class UndefinedValidator extends Validator<undefined> {
  validate(value: any) {
    return value === undefined
      ? valid(undefined)
      : invalid<undefined>(typeError("must be undefined"));
  }
}
export const forbidden: Validator<undefined> = new UndefinedValidator();

export class NullValidator extends Validator<null> {
  validate(value: any) {
    return value === null
      ? valid(null)
      : invalid<null>(typeError("must be null"));
  }
}
export const nil: Validator<null> = new NullValidator();

export class AnyValidator extends Validator<any> {
  validate(value: any) {
    return valid(value);
  }
}
export const any = new AnyValidator();

export class ArrayValidator<A> extends Validator<A[]> {
  constructor(private validator: Validator<A>) {
    super();
  }

  validate(value: any) {
    if (Array.isArray(value)) {
      let errored = false;
      let err: [number, ValidationError][] = [];
      const res = value.map((entry, i) =>
        this.validator.validate(entry).match({
          valid: (a) => a,
          invalid: (e) => {
            err.push([i, e]);
            errored = true;
            // Continue so we can get errors for all entries.
            return <A>(undefined as any);
          }
        })
      );
      return !errored ? valid(res) : invalid<A[]>(arrayError(err));
    }
    return invalid<A[]>(typeError("must be an array"));
  }
}
export function array<P, A>(validator: Validator<A>): Validator<A[]> {
  return new ArrayValidator(validator);
}

export type SchemaEntry<A extends object, B> =
  | Validator<B>
  | ((obj: A) => Validator<B>);
export type Schema<A extends object> = { [K in keyof A]: SchemaEntry<A, A[K]> };

export class ObjectValidator<
  P extends boolean,
  A extends object,
  B
> extends Validator<A> {
  private schemaEntries: [keyof A, SchemaEntry<A, A[keyof A]>, number][];
  private options: { rest?: SchemaEntry<A, B>; strict?: boolean };
  constructor(
    private schema: Schema<A>,
    options: { rest: SchemaEntry<A, B> } | { strict: boolean } = {
      strict: false
    }
  ) {
    super();
    this.options = options;
    this.schemaEntries = <any>Object.entries(schema);
    this.schemaEntries.reduce((acc, arr) => arr.push(++acc), -1);
    this.schemaEntries.sort((a, b) => {
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
  }

  validate(value: any) {
    if (typeof value === "object" && !Array.isArray(value)) {
      const keys = new Set(Object.keys(value));
      let obj: A & { [index: string]: B } = <any>{};
      let err: [string, ValidationError][] = [];
      let errored = false;

      for (const [k, v] of this.schemaEntries) {
        if (typeof v !== "function") {
          v.validate(value[k]).match({
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
            .validate(value[k])
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
          return invalid<A>(objectError(err));
        }
        keys.delete(k);
      }

      if (errored) {
        return invalid<A>(objectError(err));
      }

      if (this.options.rest !== undefined) {
        const v =
          typeof this.options.rest === "function"
            ? this.options.rest(obj)
            : this.options.rest;
        for (const k of keys) {
          v.validate(value[k]).match({
            valid: (val) => {
              obj[k] = val;
            },
            invalid: (e) => {
              err.push([k, e]);
              errored = true;
            }
          });
        }
      } else if (this.options.strict) {
        if (keys.size > 0) {
          return invalid<A>(
            error(`unknown key(s): ${Array.from(keys).join(", ")}`)
          );
        }
      } else {
        for (const k of keys) {
          obj[k] = value[k];
        }
      }

      return !errored ? valid(obj) : invalid<A>(objectError(err));
    }
    return invalid<A>(typeError("must be an object"));
  }
}

export function object<A extends object, B>(
  schema: Schema<A>,
  options: { rest: SchemaEntry<A, B> }
): Validator<Id<A & { [index: string]: B }>>;
export function object<A extends object, B>(
  schema: Schema<A>,
  options: { strict: boolean }
): Validator<A>;
export function object<A extends object, B>(schema: Schema<A>): Validator<A>;

export function object<A extends object, B>(
  schema: Schema<A>,
  options?: { rest: SchemaEntry<A, B> } | { strict: boolean }
): Validator<A> {
  return new ObjectValidator(schema, options);
}
