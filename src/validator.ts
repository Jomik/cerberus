import { Result, valid } from "./result";
import { error, propertyError } from "./errors";
import { integer } from "./initializers";
import { and, or, xor } from "./functions";
import { Id } from "./types";

export abstract class Validator<P extends boolean, A> {
  // Needed to make TypeScript care about the type of P.
  private p: P;

  abstract validate(this: Validator<false, any>, value: any): Result<A>;
  async asyncValidate(
    this: Validator<true, any>,
    value: any
  ): Promise<Result<A>> {
    return Promise.resolve((<any>this).validate(value));
  }

  test(this: Validator<false, any>, value: any): A {
    return this.validate(value).match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  async asyncTest(this: Validator<true, any>, value: any): Promise<A> {
    const result = await this.asyncValidate(value);
    return result.match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  chain<PB extends boolean, B>(other: Validator<PB, B>): Validator<P | PB, B> {
    return new ChainValidator(this, other);
  }

  optional(): Validator<P, A | undefined> {
    return new OptionalValidator(this);
  }

  and<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<P | PB, Id<A & B>> {
    return and(this, right);
  }

  or<PB extends boolean, B>(right: Validator<PB, B>): Validator<P | PB, A | B> {
    return or(this, right);
  }

  xor<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<P | PB, A | B> {
    return xor(this, right);
  }

  integer(this: Validator<P, number>) {
    return this.chain(integer);
  }
}

export class ChainValidator<
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
    return (<any>this.first).validate(value).chain(this.second.validate);
  }

  asyncValidate(value: any) {
    return (<any>this.first)
      .asyncValidate(value)
      .then((res) => res.chain(this.second.asyncValidate));
  }
}

export class DefaultValidator<P extends boolean, A> extends Validator<P, A> {
  constructor(private validator: Validator<P, A>, private def: A) {
    super();
  }

  validate(value: any) {
    return value === undefined
      ? valid(this.def)
      : (<any>this.validator).validate(value);
  }
}

export class OptionalValidator<P extends boolean, A> extends DefaultValidator<
  P,
  A | undefined
> {
  constructor(validator: Validator<P, A>) {
    super(validator, undefined);
  }
}
