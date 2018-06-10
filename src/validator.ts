import { Result, valid, invalid } from "./result";
import {
  validationError,
  propertyError,
  orError,
  ValidationError
} from "./errors";
// tslint:disable:variable-name

export abstract class Validator<PA extends boolean, A> {
  // Needed to make TypeScript care about the type of PA.
  private __PA: PA;

  abstract validate(this: Validator<false, any>, value: any): Result<A>;

  assert(this: Validator<false, any>, value: any): A {
    return this.validate(value).match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  async validateAsync(value: any): Promise<Result<A>> {
    return Promise.resolve((<any>this).validate(value));
  }

  async assertAsync(value: any): Promise<A> {
    const result = await this.validateAsync(value);
    return result.match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  private chain<PB extends boolean, B>(
    other: Validator<PB, B>
  ): Validator<PA | PB, B> {
    return new ChainValidator(this, other);
  }

  map<B>(f: (value: A) => B): Validator<PA, B> {
    return new MapValidator(this, f);
  }

  mapAsync<B>(f: (value: A) => Promise<B>): Validator<true, B> {
    return new MapAsyncValidator(this, f);
  }

  and<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<PA | PB, A & B> {
    return new AndValidator(this, right);
  }

  or<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<PA | PB, A | B> {
    return new OrValidator(this, right);
  }

  xor<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<PA | PB, A | B> {
    return new XOrValidator(this, right);
  }

  optional(): Validator<PA, A | undefined> {
    return new OptionalValidator(this);
  }

  default(def: A): Validator<PA, A> {
    return new DefaultValidator(this, def);
  }

  not(value: A) {
    return this.chain(predicate<A>((v) => v !== value, `must not be ${value}`));
  }

  predicate(f: (value: A) => boolean, error: string) {
    return this.chain(predicate(f, error));
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
      predicate<any>((v) => v.includes(value), `must include ${value}`)
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
    return this.chain(greater(lower).and(less(upper)));
  }

  positive(this: Validator<any, number>): Validator<PA, number> {
    return this.greater(0);
  }

  negative(this: Validator<any, number>): Validator<PA, number> {
    return this.less(0);
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

  validate(this: ChainValidator<false, any, false, any>, value: any) {
    return this.first.validate(value).chain((v) => this.second.validate(v));
  }

  async validateAsync(value: any) {
    const result = await this.first.validateAsync(value);
    return result.chain((v) => this.second.validateAsync(v));
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

  async validateAsync(value: any): Promise<Result<A & B>> {
    const result = await this.left.validateAsync(value);
    return <any>result.chain(() => this.right.validateAsync(value));
  }
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

  async validateAsync(value: any) {
    const lr = await this.left.validateAsync(value);
    return lr.match({
      valid: async () => lr,
      invalid: async (le) => {
        const rr = await this.right.validateAsync(value);
        return rr.match({
          valid: () => rr,
          invalid: (re) => invalid<A | B>(orError(le, re))
        });
      }
    });
  }
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
    if (lr.info.valid) {
      if (!rr.info.valid) {
        return lr;
      }
      return invalid(validationError("must not satisfy both conditions"));
    } else if (rr.info.valid) {
      return rr;
    }
    return invalid(orError(lr.info.error, rr.info.error));
  }

  validate(this: XOrValidator<false, any, false, any>, value: any) {
    const lr = this.left.validate(value);
    const rr = this.right.validate(value);
    return this.logic(lr, rr);
  }

  async validateAsync(value: any) {
    const [lr, rr] = await Promise.all([
      this.left.validateAsync(value),
      this.right.validateAsync(value)
    ]);
    return this.logic(lr, rr);
  }
}

class MapValidator<PA extends boolean, A, B> extends Validator<PA, B> {
  constructor(private validator: Validator<PA, A>, private f: (value: A) => B) {
    super();
  }

  validate(this: MapValidator<false, any, any>, value: any): Result<B> {
    return this.validator.validate(value).chain((v) => valid(this.f(v)));
  }

  async validateAsync(
    this: MapValidator<true, any, any>,
    value: any
  ): Promise<Result<B>> {
    const result = await this.validator.validateAsync(value);
    return result.chain((v) => valid(this.f(v)));
  }
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

  async validateAsync(value: any): Promise<Result<B>> {
    const result = await this.validator.validateAsync(value);
    return result.chain(async (v) => valid(await this.f(v)));
  }
}

class PredicateValidator<A> extends Validator<false, A> {
  error: ValidationError;
  constructor(private f: (value: A) => boolean, error: string) {
    super();
    this.error = new ValidationError(error);
  }

  validate(value: A): Result<A> {
    return this.f(value) ? valid(value) : invalid(this.error);
  }
}

function predicate<A>(
  f: (value: A) => boolean,
  error: string
): Validator<false, A> {
  return new PredicateValidator(f, error);
}

function greater<A>(value: A) {
  return predicate<A>((v) => v > value, `must be greater than ${value}`);
}

function greaterEqual<A>(value: A) {
  return predicate<A>(
    (v) => v >= value,
    `must be greater than or equal to ${value}`
  );
}

function less<A>(value: A) {
  return predicate<A>((v) => v < value, `must be less than ${value}`);
}

function lessEqual<A>(value: A) {
  return predicate<A>(
    (v) => v <= value,
    `must be less than or equal to ${value}`
  );
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
  private static readonly dummy = new class extends Validator<false, any> {
    validate(value) {
      return valid(value);
    }
  }();

  private validator: Validator<PA, any>;

  constructor(
    private prop: T,
    validator: (v: Validator<false, A[T]>) => Validator<PA, any>
  ) {
    super();
    this.validator = validator(PropertyValidator.dummy);
  }

  validate(this: PropertyValidator<false, any, any>, value: A) {
    return this.validator.validate(value[this.prop]).match({
      valid: () => valid(value),
      invalid: (e) => invalid(propertyError(this.prop, e))
    });
  }

  async validateAsync(value: any) {
    const result = await this.validator.validateAsync(value[this.prop]);
    return result.match({
      valid: () => valid(value),
      invalid: (e) => invalid(propertyError(this.prop.toString(), e))
    });
  }
}
