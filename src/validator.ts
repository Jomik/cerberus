import { Result, valid } from "./result";
import { error, propertyError } from "./errors";
import { integer } from "./initializers";
import { and, or, xor } from "./functions";
import { Id, IsAsync } from "./types";

export abstract class Validator<PA extends boolean, A> {
  // Needed to make TypeScript care about the type of PA.
  private p: PA;

  abstract validate(this: Validator<false, any>, value: any): Result<A>;

  test(this: Validator<false, any>, value: any): A {
    return this.validate(value).match({
      valid: (val) => val,
      invalid: (err) => {
        throw err;
      }
    });
  }

  async asyncValidate(
    this: Validator<true, any>,
    value: any
  ): Promise<Result<A>> {
    return Promise.resolve((<any>this).validate(value));
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

  chain<PB extends boolean, B>(
    other: Validator<PB, B>
  ): Validator<IsAsync<PA | PB>, B> {
    return new ChainValidator(this, other);
  }

  optional(): Validator<P, A | undefined> {
    return new OptionalValidator(this);
  }

  and<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<IsAsync<PA | PB>, A & B> {
    return and(this, right);
  }

  or<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<IsAsync<PA | PB>, A | B> {
    return or(this, right);
  }

  xor<PB extends boolean, B>(
    right: Validator<PB, B>
  ): Validator<IsAsync<PA | PB>, A | B> {
    return xor(this, right);
  }

  integer(this: Validator<any, number>): Validator<PA, number>;
  integer(): Validator<any, number> {
    return this.chain(integer);
  }
}

export class ChainValidator<
  PA extends boolean,
  A,
  PB extends boolean,
  B
> extends Validator<IsAsync<PA | PB>, B> {
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
