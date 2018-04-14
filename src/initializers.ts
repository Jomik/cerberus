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

export class NumberValidator extends Validator<false, number> {
  validate(value: any) {
    return typeof value === "number"
      ? valid(value)
      : invalid<number>(typeError("must be a number"));
  }
}
export const number: Validator<false, number> = new NumberValidator();

export class IntegerValidator extends Validator<false, number> {
  validate(value: number) {
    return Number.isInteger(value)
      ? valid(value)
      : invalid<number>(error("must be an integer"));
  }
}
export const integer: Validator<false, number> = new IntegerValidator();

export class StringValidator extends Validator<false, string> {
  validate(value: any) {
    return typeof value === "string"
      ? valid(value)
      : invalid<string>(typeError("must be a string"));
  }
}
export const string: Validator<false, string> = new StringValidator();

export class BooleanValidator extends Validator<false, boolean> {
  validate(value: any) {
    return typeof value === "boolean"
      ? valid(value)
      : invalid<boolean>(typeError("must be a boolean"));
  }
}
export const boolean: Validator<false, boolean> = new BooleanValidator();

export class DefinedValidator extends Validator<false, any> {
  validate(value: any) {
    return value !== undefined && value !== null
      ? valid(value)
      : invalid(typeError("must be defined"));
  }
}
export const required = new DefinedValidator();

export class UndefinedValidator extends Validator<false, undefined> {
  validate(value: any) {
    return value === undefined
      ? valid(undefined)
      : invalid<undefined>(typeError("must be undefined"));
  }
}
export const forbidden: Validator<false, undefined> = new UndefinedValidator();

export class NullValidator extends Validator<false, null> {
  validate(value: any) {
    return value === null
      ? valid(null)
      : invalid<null>(typeError("must be null"));
  }
}
export const nil: Validator<false, null> = new NullValidator();

export class AnyValidator extends Validator<false, any> {
  validate(value: any) {
    return valid(value);
  }
}
export const any: Validator<false, any> = new AnyValidator();

export class ArrayValidator<P extends boolean, A> extends Validator<P, A[]> {
  constructor(private validator: Validator<P, A>) {
    super();
  }

  private logic(results: Result<A>[]) {
    let errors: [number, ValidationError][] = [];
    const values = results.map((r, i) =>
      r.match({
        valid: (v) => v,
        invalid: (e) => {
          errors.push([i, e]);
          return <A>(undefined as any);
        }
      })
    );
    return errors.length === 0
      ? valid(values)
      : invalid<A[]>(arrayError(errors));
  }

  validate(this: ArrayValidator<false, any>, value: any) {
    if (Array.isArray(value)) {
      return this.logic(value.map(this.validator.validate));
    }
    return invalid<A[]>(typeError("must be an array"));
  }

  async asyncValidate(this: ArrayValidator<true, any>, value: any) {
    if (Array.isArray(value)) {
      const results = await Promise.all(
        value.map(this.validator.asyncValidate)
      );
      return this.logic(results);
    }
    return invalid<A[]>(typeError("must be an array"));
  }
}
export function array<P extends boolean, A>(
  validator: Validator<P, A>
): Validator<P, A[]> {
  return new ArrayValidator(validator);
}

export type SchemaEntry<P extends boolean, A extends object, B> =
  | Validator<P, B>
  | ((obj: A) => Validator<P, B>);
export type Schema<P extends boolean, A extends object> = {
  [K in keyof A]: SchemaEntry<P, A, A[K]>
};

export class ObjectValidator<
  P extends boolean,
  A extends object,
  B = never
> extends Validator<P, Id<A & { [index: string]: B }>> {
  private schemaEntries: [keyof A, Validator<P, A[keyof A]>][];
  private schemaEntriesFunc: [keyof A, (obj: A) => Validator<P, A[keyof A]>][];
  private options: { rest?: SchemaEntry<P, A, B>; strict?: boolean };
  constructor(
    private schema: Schema<P, A>,
    options: { rest: SchemaEntry<P, A, B> } | { strict: boolean } = {
      strict: false
    }
  ) {
    super();
    this.options = options;

    const entries = Object.entries<SchemaEntry<P, A, A>>(<any>schema);
    this.schemaEntries = <any>entries.filter(
      ([k, v]) => typeof v !== "function"
    );
    this.schemaEntriesFunc = <any>entries.filter(
      ([k, v]) => typeof v === "function"
    );
  }

  async asyncValidate(
    this: ObjectValidator<true, any, any>,
    value: any
  ): Promise<Result<Id<A & { [index: string]: B }>>> {
    if (typeof value === "object" && !Array.isArray(value)) {
      let obj: A & { [index: string]: B } = <any>{};
      let errors: [string, ValidationError][] = [];
      const keys = new Set(Object.keys(value));

      const basicResults = await Promise.all(
        this.schemaEntries.map(
          async ([k, v]) =>
            <[keyof A, Result<A[keyof A]>]>[k, await v.asyncValidate(value[k])]
        )
      );
      for (const [k, res] of basicResults) {
        res.match<void>({
          valid: (v) => (obj[k] = v),
          invalid: (e) => errors.push([k, e])
        });
        keys.delete(k);
      }

      if (errors.length > 0) {
        return invalid(objectError(errors));
      }

      for (const [k, vali] of this.schemaEntriesFunc) {
        const res = await vali(obj).asyncValidate(value[k]);
        const err = res.match<ValidationError | undefined>({
          valid: (v) => (obj[k] = v),
          invalid: (e) => e
        });
        if (err !== undefined) {
          return invalid(objectError(<any>[k, err]));
        }
        keys.delete(k);
      }

      if (this.options.rest !== undefined) {
        const vali =
          typeof this.options.rest === "function"
            ? this.options.rest(obj)
            : this.options.rest;
        const restResults = await Promise.all(
          Array.from(keys).map(
            async (k) =>
              <[string, Result<B>]>[k, await vali.asyncValidate(value[k])]
          )
        );
        for (const [k, res] of restResults) {
          res.match<void>({
            valid: (v) => (obj[k] = v),
            invalid: (e) => errors.push([k, e])
          });
        }

        if (errors.length > 0) {
          return invalid(objectError(errors));
        }
      } else if (this.options.strict) {
        if (keys.size > 0) {
          return invalid<any>(
            error(`unknown key(s): ${Array.from(keys).join(", ")}`)
          );
        }
      } else {
        for (const k of keys) {
          obj[k] = value[k];
        }
      }
      return valid(<Id<A & { [index: string]: B }>>obj);
    }
    return invalid(typeError("must be an object"));
  }

  validate(
    this: ObjectValidator<false, any, any>,
    value: any
  ): Result<Id<A & { [index: string]: B }>> {
    if (typeof value === "object" && !Array.isArray(value)) {
      let obj: A & { [index: string]: B } = <any>{};
      let errors: [string, ValidationError][] = [];
      const keys = new Set(Object.keys(value));

      const basicResults = this.schemaEntries.map(
        ([k, v]) => <[keyof A, Result<A[keyof A]>]>[k, v.validate(value[k])]
      );
      for (const [k, res] of basicResults) {
        res.match<void>({
          valid: (v) => (obj[k] = v),
          invalid: (e) => errors.push([k, e])
        });
        keys.delete(k);
      }

      if (errors.length > 0) {
        return invalid(objectError(errors));
      }

      for (const [k, vali] of this.schemaEntriesFunc) {
        const res = vali(obj).validate(value[k]);
        const err = res.match<ValidationError | undefined>({
          valid: (v) => (obj[k] = v),
          invalid: (e) => e
        });
        if (err !== undefined) {
          return invalid(objectError(<any>[k, err]));
        }
        keys.delete(k);
      }

      if (this.options.rest !== undefined) {
        const vali =
          typeof this.options.rest === "function"
            ? this.options.rest(obj)
            : this.options.rest;
        const restResults = Array.from(keys).map(
          (k) => <[string, Result<B>]>[k, vali.validate(value[k])]
        );
        for (const [k, res] of restResults) {
          res.match<void>({
            valid: (v) => (obj[k] = v),
            invalid: (e) => errors.push([k, e])
          });
        }

        if (errors.length > 0) {
          return invalid(objectError(errors));
        }
      } else if (this.options.strict) {
        if (keys.size > 0) {
          return invalid<any>(
            error(`unknown key(s): ${Array.from(keys).join(", ")}`)
          );
        }
      } else {
        for (const k of keys) {
          obj[k] = value[k];
        }
      }
      return valid(<Id<A & { [index: string]: B }>>obj);
    }
    return invalid(typeError("must be an object"));
  }
}

export function object<A extends object, B>(
  schema: Schema<false, A>,
  options: { rest: SchemaEntry<false, A, B> }
): Validator<false, Id<A & { [index: string]: B }>>;
export function object<A extends object>(
  schema: Schema<false, A>,
  options: { strict: boolean }
): Validator<false, A>;
export function object<A extends object>(
  schema: Schema<false, A>
): Validator<false, A>;

export function object<A extends object, B>(
  schema: Schema<boolean, A>,
  options: { rest: SchemaEntry<boolean, A, B> }
): Validator<true, Id<A & { [index: string]: B }>>;
export function object<A extends object>(
  schema: Schema<boolean, A>,
  options: { strict: boolean }
): Validator<true, A>;
export function object<A extends object>(
  schema: Schema<boolean, A>
): Validator<true, A>;

export function object<P extends boolean, A extends object, B = never>(
  schema: Schema<P, A>,
  options?: { rest: SchemaEntry<P, A, B> } | { strict: boolean }
): Validator<boolean, Id<A & { [index: string]: B }>> {
  return new ObjectValidator(schema, options);
}
