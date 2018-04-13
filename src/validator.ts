import { Result, valid } from "./result";
import { error, propertyError } from "./errors";
import { integer, NumberValidator } from "./initializers";
import { and, or, xor } from "./functions";
import { Id } from "./types";

export abstract class Validator<A> {
  abstract validate(value: any): Result<A>;
  async asyncValidate(value: any): Promise<Result<A>> {
    return Promise.resolve(this.validate(value));
  }

  test(value: any): A {
    return this.validate(value).match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  async asyncTest(value: any) {
    const result = await this.asyncValidate(value);
    return result.match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  chain<B>(other: Validator<B>): Validator<B> {
    return new ChainValidator(this, other);
  }

  optional(): Validator<A | undefined> {
    return new OptionalValidator(this);
  }

  integer(this: Validator<number>): Validator<number> {
    return this.chain(integer);
  }

  and<B>(right: Validator<B>): Validator<Id<A & B>> {
    return and(this, right);
  }

  or<B>(right: Validator<B>): Validator<A | B> {
    return or(this, right);
  }

  xor<B>(right: Validator<B>): Validator<A | B> {
    return xor(this, right);
  }
}

export class ChainValidator<A, B> extends Validator<B> {
  constructor(private first: Validator<A>, private second: Validator<B>) {
    super();
  }

  validate(value: any) {
    return this.first.validate(value).chain(this.second.validate);
  }

  asyncValidate(value: any) {
    return this.first
      .asyncValidate(value)
      .then((res) => res.chain(this.second.asyncValidate));
  }
}

export class DefaultValidator<A> extends Validator<A> {
  constructor(private validator: Validator<A>, private def: A) {
    super();
  }

  validate(value: any) {
    return value === undefined
      ? valid(this.def)
      : this.validator.validate(value);
  }
}

export class OptionalValidator<A> extends DefaultValidator<A | undefined> {
  constructor(validator: Validator<A>) {
    super(validator, undefined);
  }
}
