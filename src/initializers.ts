import {
  typeError,
  validationError,
  ValidationError,
  arrayError,
  objectError,
  ValidationTypeError
} from "./errors";
import { Validator } from "./validator";
import { valid, Result, invalid } from "./result";
// tslint:disable:variable-name
class TypeValidator<A> extends Validator<false, A> {
  error: ValidationTypeError;
  constructor(private f: (value: A) => boolean, error: string) {
    super();
    this.error = typeError(error);
  }

  validate(value: A): Result<A> {
    return this.f(value) ? valid(value) : invalid(this.error);
  }
}

function type<A>(f: (value: A) => boolean, error: string): Validator<false, A> {
  return new TypeValidator(f, error);
}

export const number = type<number>(
  (v) => typeof v === "number",
  "must be a number"
);

export const integer = type<number>(
  (v) => Number.isInteger(v),
  "must be an integer"
);

export const string = type<string>(
  (v) => typeof v === "string",
  "must be a string"
);

export const boolean = type<boolean>(
  (v) => typeof v === "boolean",
  "must be a boolean"
);

export const required = type<any>(
  (v) => v !== undefined && v !== null,
  "must be defined"
);

export const forbidden = type<undefined>(
  (v) => v === undefined,
  "must be undefined"
);

export function is<A>(value: A) {
  return type<A>((v) => v === value, `must be ${value}`);
}

export const nil = type<null>((v) => v === null, "must be null");

class AnyValidator extends Validator<false, any> {
  validate(value: any) {
    return valid(value);
  }
}
export const any: Validator<false, any> = new AnyValidator();

class ArrayValidator<P extends boolean, A> extends Validator<P, A[]> {
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
      return this.logic(value.map((v) => this.validator.validate(v)));
    }
    return invalid<A[]>(typeError("must be an array"));
  }

  async validateAsync(value: any) {
    if (Array.isArray(value)) {
      const results = await Promise.all(
        value.map((v) => this.validator.validateAsync(v))
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

class ObjectValidator<P extends boolean, A extends object> extends Validator<
  P,
  A
> {
  private schemaEntries: [keyof A, Validator<P, A[keyof A]>][];
  private schemaEntriesFunc: [keyof A, (obj: A) => Validator<P, A[keyof A]>][];
  constructor(
    public readonly schema: Schema<P, A>,
    private strict: boolean = false
  ) {
    super();

    const entries = Object.entries<SchemaEntry<P, A, A>>(<any>schema);
    this.schemaEntries = <any>(
      entries.filter(([k, v]) => typeof v !== "function")
    );
    this.schemaEntriesFunc = <any>(
      entries.filter(([k, v]) => typeof v === "function")
    );
  }

  validate(this: ObjectValidator<false, any>, value: any): Result<A> {
    if (typeof value === "object" && !Array.isArray(value)) {
      let obj: A = <any>{};
      let errors: [string, ValidationError][] = [];
      const keys = new Set(Object.keys(value));

      const basicResults = this.schemaEntries.map(
        ([k, v]) => <[keyof A, Result<A[keyof A]>]>[k, v.validate(value[k])]
      );
      for (const [k, res] of basicResults) {
        res.match<void>({
          valid: (v) => (obj[k] = v),
          invalid: (e) => errors.push([k.toString(), e])
        });
        keys.delete(k.toString());
      }

      if (errors.length > 0) {
        return invalid(objectError(errors));
      }

      for (const [k, vali] of this.schemaEntriesFunc) {
        const res = vali(obj).validate(value[k]);
        const err = res.match<ValidationError | void>({
          valid: (v) => {
            obj[<keyof A>k] = v;
          },
          invalid: (e) => e
        });
        if (err !== undefined) {
          return invalid(objectError(<any>[k, err]));
        }
        keys.delete(k.toString());
      }

      if (this.strict) {
        if (keys.size > 0) {
          return invalid<any>(
            validationError(`unknown key(s): ${Array.from(keys).join(", ")}`)
          );
        }
      } else {
        for (const k of keys) {
          obj[k] = value[k];
        }
      }
      return valid(obj);
    }
    return invalid(typeError("must be an object"));
  }

  async validateAsync(value: any): Promise<Result<A>> {
    if (typeof value === "object" && !Array.isArray(value)) {
      let obj: A = <any>{};
      let errors: [string, ValidationError][] = [];
      const keys = new Set(Object.keys(value));

      const basicResults = await Promise.all(
        this.schemaEntries.map(
          async ([k, v]) =>
            <[keyof A, Result<A[keyof A]>]>[k, await v.validateAsync(value[k])]
        )
      );
      for (const [k, res] of basicResults) {
        res.match<void>({
          valid: (v) => (obj[k] = v),
          invalid: (e) => errors.push([k.toString(), e])
        });
        keys.delete(k.toString());
      }

      if (errors.length > 0) {
        return invalid(objectError(errors));
      }

      for (const [k, vali] of this.schemaEntriesFunc) {
        const res = await vali(obj).validateAsync(value[k]);
        const err = res.match<ValidationError | void>({
          valid: (v) => {
            obj[k] = v;
          },
          invalid: (e) => e
        });
        if (err !== undefined) {
          return invalid(objectError([[k.toString(), err]]));
        }
        keys.delete(k.toString());
      }

      if (this.strict) {
        if (keys.size > 0) {
          return invalid<any>(
            validationError(`unknown key(s): ${Array.from(keys).join(", ")}`)
          );
        }
      } else {
        for (const k of keys) {
          obj[k] = value[k];
        }
      }
      return valid(obj);
    }
    return invalid(typeError("must be an object"));
  }
}

export function object<A extends object>(
  schema: Schema<false, A>,
  strict?: boolean
): ObjectValidator<false, A>;
export function object<A extends object>(
  schema: Schema<boolean, A>,
  strict?: boolean
): ObjectValidator<true, A>;
export function object<PA extends boolean, A extends object>(
  schema: Schema<PA, A>,
  strict: boolean = false
): ObjectValidator<PA, A> {
  return new ObjectValidator(schema, strict);
}
