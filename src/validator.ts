import { Result, valid, invalid } from "./result";
import {
  validationError,
  propertyError,
  orError,
  typeError,
  ValidationError,
  arrayError,
  objectError
} from "./errors";
import { Id } from "./types";
// tslint:disable:variable-name

export abstract class Validator<PA extends boolean, A> {
  // Needed to make TypeScript care about the type of PA.
  private __PA: PA;

  abstract validate(this: Validator<false, any>, value: any): Result<A>;

  test(this: Validator<false, any>, value: any): A {
    return this.validate(value).match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  async asyncValidate(value: any): Promise<Result<A>> {
    return Promise.resolve((<any>this).validate(value));
  }

  async asyncTest(value: any): Promise<A> {
    const result = await this.asyncValidate(value);
    return result.match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  chain<PB extends boolean, B>(other: Validator<PB, B>): Validator<PA | PB, B> {
    return new ChainValidator(this, other);
  }

  map<B>(f: (value: A) => B): Validator<PA, B> {
    return map(this, f);
  }

  mapAsync<B>(f: (value: A) => Promise<B>): Validator<true, B> {
    return mapAsync(this, f);
  }

  and<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<PA | PB, A & B> {
    return and(this, right);
  }

  or<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<PA | PB, A | B> {
    return or(this, right);
  }

  xor<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<PA | PB, A | B> {
    return xor(this, right);
  }

  optional(): Validator<PA, A | undefined> {
    return new OptionalValidator(this);
  }

  default(def: A): Validator<PA, A> {
    return new DefaultValidator(this, def);
  }

  integer(this: Validator<any, number>): Validator<PA, number>;
  integer(this: Validator<any, number>): Validator<any, number> {
    return this.chain(integer);
  }

  equal(value: A) {
    return this.chain(is(value));
  }

  not(value: A) {
    return this.chain(not(value));
  }

  length<P extends boolean>(
    this: Validator<any, string>,
    validator: (v: Validator<false, number>) => Validator<P, any>
  ): Validator<PA | P, A>;
  length<P extends boolean>(
    this: Validator<any, any[]>,
    validator: (v: Validator<false, number>) => Validator<P, any>
  ): Validator<PA | P, A>;
  length<P extends boolean>(
    validator: (v: Validator<false, number>) => Validator<P, any>
  ): Validator<boolean, A> {
    return this.chain(new PropertyValidator("length", validator));
  }

  includes<P extends boolean>(
    this: Validator<any, string>,
    value: A
  ): Validator<PA, A>;
  includes<P extends boolean>(
    this: Validator<any, any[]>,
    value: A extends Array<infer B> ? B : never
  ): Validator<PA, A>;
  includes<P extends boolean>(value: any): Validator<any, A> {
    return this.chain(
      predicate<any>(
        (v) => v.includes(value),
        validationError(`must include ${value}`)
      )
    );
  }

  greater(this: Validator<any, number>, value: number): Validator<PA, number>;
  greater(this: Validator<any, Date>, value: Date): Validator<PA, Date>;
  greater(value: any): Validator<any, any> {
    return this.chain(greater(value));
  }

  greaterEqual(
    this: Validator<any, number>,
    value: number
  ): Validator<PA, number>;
  greaterEqual(this: Validator<any, Date>, value: Date): Validator<PA, Date>;
  greaterEqual(value: any): Validator<any, any> {
    return this.chain(greaterEqual(value));
  }

  less(this: Validator<any, number>, value: number): Validator<PA, number>;
  less(this: Validator<any, Date>, value: Date): Validator<PA, Date>;
  less(value: any): Validator<any, any> {
    return this.chain(less(value));
  }

  lessEqual(this: Validator<any, number>, value: number): Validator<PA, number>;
  lessEqual(this: Validator<any, Date>, value: Date): Validator<PA, Date>;
  lessEqual(value: any): Validator<any, any> {
    return this.chain(lessEqual(value));
  }

  between(
    this: Validator<any, number>,
    lower: number,
    upper: number
  ): Validator<PA, number>;
  between(
    this: Validator<any, Date>,
    lower: Date,
    upper: Date
  ): Validator<PA, Date>;
  between(lower: any, upper: any): Validator<any, any> {
    return this.chain(and(greater(lower), less(upper)));
  }

  positive(this: Validator<any, number>): Validator<PA, number> {
    return this.greater(0);
  }

  negative(this: Validator<any, number>): Validator<PA, number> {
    return this.less(0);
  }

  multiple(this: Validator<any, number>, base: number): Validator<PA, number> {
    return this.chain(multiple(base));
  }
}

class ChainValidator<
  PA extends boolean,
  A,
  PB extends boolean,
  B
> extends Validator<PA | PB, B> {
  constructor(
    private first: Validator<PA, A>,
    private second: Validator<PB, B>
  ) {
    super();
  }

  validate(value: any) {
    return (<any>this.first)
      .validate(value)
      .chain((v) => (<any>this.second).validate(v));
  }

  async asyncValidate(value: any) {
    const result = await this.first.asyncValidate(value);
    return result.chain((v) => this.second.asyncValidate(v));
  }
}

class AndValidator<
  PA extends boolean,
  A,
  PB extends boolean,
  B
> extends Validator<PA | PB, A & B> {
  constructor(private left: Validator<PA, A>, private right: Validator<PB, B>) {
    super();
  }

  validate(
    this: AndValidator<false, any, false, any>,
    value: any
  ): Result<A & B> {
    return this.left.validate(value).chain(() => this.right.validate(value));
  }

  async asyncValidate(value: any): Promise<Result<A & B>> {
    const result = await this.left.asyncValidate(value);
    return <any>result.chain(() => this.right.asyncValidate(value));
  }
}

export function and<PA extends boolean, A, PB extends boolean, B>(
  left: Validator<PA, A>,
  right: Validator<PB, B>
): Validator<PA | PB, A & B> {
  return new AndValidator(left, right);
}

class OrValidator<
  PA extends boolean,
  A,
  PB extends boolean,
  B
> extends Validator<PA | PB, A | B> {
  constructor(private left: Validator<PA, A>, private right: Validator<PB, B>) {
    super();
  }

  validate(this: OrValidator<false, any, false, any>, value: any) {
    return this.left.validate(value).match({
      valid: (a) => valid(a),
      invalid: (l) =>
        this.right.validate(value).match({
          valid: (b) => valid(b),
          invalid: (r) => invalid<A | B>(orError(l, r))
        })
    });
  }

  async asyncValidate(value: any) {
    const lr = await this.left.asyncValidate(value);
    return lr.match({
      valid: async () => lr,
      invalid: async (le) => {
        const rr = await this.right.asyncValidate(value);
        return rr.match({
          valid: () => rr,
          invalid: (re) => invalid<A | B>(orError(le, re))
        });
      }
    });
  }
}
export function or<PA extends boolean, A, PB extends boolean, B>(
  left: Validator<PA, A>,
  right: Validator<PB, B>
): Validator<PA | PB, A | B> {
  return new OrValidator(left, right);
}

class XOrValidator<
  PA extends boolean,
  A,
  PB extends boolean,
  B
> extends Validator<PA | PB, A | B> {
  constructor(private left: Validator<PA, A>, private right: Validator<PB, B>) {
    super();
  }

  private logic(lr: Result<A>, rr: Result<B>): Result<A | B> {
    if (lr.result.valid) {
      if (!rr.result.valid) {
        return lr;
      }
      return invalid(validationError("must not satisfy both conditions"));
    } else if (rr.result.valid) {
      return rr;
    }
    return invalid(orError(lr.result.error, rr.result.error));
  }

  validate(this: XOrValidator<false, any, false, any>, value: any) {
    const lr = this.left.validate(value);
    const rr = this.right.validate(value);
    return this.logic(lr, rr);
  }

  async asyncValidate(value: any) {
    const [lr, rr] = await Promise.all([
      this.left.asyncValidate(value),
      this.right.asyncValidate(value)
    ]);
    return this.logic(lr, rr);
  }
}
export function xor<PA extends boolean, A, PB extends boolean, B>(
  left: Validator<PA, A>,
  right: Validator<PB, B>
): Validator<PA | PB, A | B> {
  return new XOrValidator(left, right);
}

class MapValidator<PA extends boolean, A, B> extends Validator<PA, B> {
  constructor(private validator: Validator<PA, A>, private f: (value: A) => B) {
    super();
  }

  validate(this: MapValidator<false, any, any>, value: any): Result<B> {
    return this.validator.validate(value).chain((v) => valid(this.f(v)));
  }

  async asyncValidate(
    this: MapValidator<true, any, any>,
    value: any
  ): Promise<Result<B>> {
    const result = await this.validator.asyncValidate(value);
    return result.chain((v) => valid(this.f(v)));
  }
}
export function map<PA extends boolean, A, B>(
  validator: Validator<PA, A>,
  f: (value: A) => B
): Validator<PA, B> {
  return new MapValidator(validator, f);
}

class MapAsyncValidator<A, B> extends Validator<true, B> {
  constructor(
    private validator: Validator<boolean, A>,
    private f: (value: A) => Promise<B>
  ) {
    super();
  }

  validate(value: any): never {
    throw new Error("trying to synchronously validate an asynchron validator");
  }

  async asyncValidate(value: any): Promise<Result<B>> {
    const result = await this.validator.asyncValidate(value);
    return result.chain(async (v) => valid(await this.f(v)));
  }
}
export function mapAsync<A, B>(
  validator: Validator<boolean, A>,
  f: (value: A) => Promise<B>
): Validator<true, B> {
  return new MapAsyncValidator(validator, f);
}

class PredicateValidator<A> extends Validator<false, A> {
  constructor(
    private pred: (value: A) => boolean,
    private error: ValidationError
  ) {
    super();
  }

  validate(value: A): Result<A> {
    return this.pred(value) ? valid(value) : invalid(this.error);
  }
}
function predicate<A>(
  pred: (value: A) => boolean,
  error: ValidationError
): Validator<false, A> {
  return new PredicateValidator(pred, error);
}

// Initializers
export const number = predicate<number>(
  (v) => typeof v === "number",
  typeError("must be a number")
);

export const integer = predicate<number>(
  (v) => Number.isInteger(v),
  typeError("must be an integer")
);

export const string = predicate<string>(
  (v) => typeof v === "string",
  typeError("must be a string")
);

export const boolean = predicate<boolean>(
  (v) => typeof v === "boolean",
  typeError("must be a boolean")
);

export const required = predicate<any>(
  (v) => v !== undefined && v !== null,
  validationError("must be defined")
);

export const forbidden = predicate<undefined>(
  (v) => v === undefined,
  validationError("must be undefined")
);

export const nil = predicate<null>(
  (v) => v === null,
  typeError("must be null")
);

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

  async asyncValidate(value: any) {
    if (Array.isArray(value)) {
      const results = await Promise.all(
        value.map((v) => this.validator.asyncValidate(v))
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

class ObjectValidator<
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
    this.schemaEntries = <any>(
      entries.filter(([k, v]) => typeof v !== "function")
    );
    this.schemaEntriesFunc = <any>(
      entries.filter(([k, v]) => typeof v === "function")
    );
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
            validationError(`unknown key(s): ${Array.from(keys).join(", ")}`)
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

  async asyncValidate(
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
          invalid: (e) => errors.push([k.toString(), e])
        });
        keys.delete(k.toString());
      }

      if (errors.length > 0) {
        return invalid(objectError(errors));
      }

      for (const [k, vali] of this.schemaEntriesFunc) {
        const res = await vali(obj).asyncValidate(value[k]);
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
            validationError(`unknown key(s): ${Array.from(keys).join(", ")}`)
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

export function object<A extends object, B = never>(
  schema: Schema<boolean, A>,
  options?: { rest: SchemaEntry<boolean, A, B> } | { strict: boolean }
): Validator<boolean, Id<A & { [index: string]: B }>> {
  return new ObjectValidator(schema, options);
}

// General validators
class DefaultValidator<P extends boolean, A> extends Validator<P, A> {
  constructor(private validator: Validator<P, A>, private def: A) {
    super();
  }

  validate(value: any) {
    return value === undefined
      ? valid(this.def)
      : (<any>this.validator).validate(value);
  }
}

class OptionalValidator<P extends boolean, A> extends DefaultValidator<
  P,
  A | undefined
> {
  constructor(validator: Validator<P, A>) {
    super(validator, undefined);
  }
}

class PropertyValidator<
  PA extends boolean,
  A,
  T extends keyof A
> extends Validator<PA, A> {
  private validator: Validator<PA, any>;
  constructor(
    private prop: T,
    validator: (v: Validator<false, A[T]>) => Validator<PA, any>
  ) {
    super();
    this.validator = validator(any);
  }

  validate(this: PropertyValidator<false, any, any>, value: A) {
    return this.validator.validate(value[this.prop]).match({
      valid: () => valid(value),
      invalid: (e) => invalid(propertyError(this.prop, e))
    });
  }

  async asyncValidate(value: any) {
    const result = await this.validator.asyncValidate(value[this.prop]);
    return result.match({
      valid: () => valid(value),
      invalid: (e) => invalid(propertyError(this.prop.toString(), e))
    });
  }
}

// Operators

export function is<A>(value: A) {
  return predicate<A>((v) => v === value, validationError(`must be ${value}`));
}

function not<A>(value: A) {
  return predicate<A>(
    (v) => v !== value,
    validationError(`must not be ${value}`)
  );
}

function greater<A>(value: A) {
  return predicate<A>(
    (v) => v > value,
    validationError(`must be greater than ${value}`)
  );
}

function greaterEqual<A>(value: A) {
  return predicate<A>(
    (v) => v >= value,
    validationError(`must be greater than or equal to ${value}`)
  );
}

function less<A>(value: A) {
  return predicate<A>(
    (v) => v < value,
    validationError(`must be less than ${value}`)
  );
}

function lessEqual<A>(value: A) {
  return predicate<A>(
    (v) => v <= value,
    validationError(`must be less than or equal to ${value}`)
  );
}

// Number

function multiple(base: number) {
  return predicate<number>(
    (v) => Number.isInteger(v / base),
    validationError(`must be a multiple of ${base}`)
  );
}
