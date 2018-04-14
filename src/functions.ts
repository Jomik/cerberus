import { Validator } from "./validator";
import { Result, invalid, valid } from "./result";
import { orError, error } from "./errors";
import { Id, IsAsync } from "./types";

// export function is<A>(a: A): TypeValidator<A> {
//   return typeValidator(
//     (o) => (o === a ? valid(o) : invalid(error(`must be ${a}`)))
//   );
// }

// export function oneOf<A, B, C>(...args: [A, B, C][]): TypeValidator<B, C]>;
// export function oneOf<A, B>(...args: [A, B][]): TypeValidator<B]>;
// export function oneOf<A extends string>(...args: A[]): TypeValidator<A>;
// export function oneOf<A extends number>(...args: A[]): TypeValidator<A>;
// export function oneOf<A>(...args: A[]): TypeValidator<A>;
// export function oneOf<A>(...args: A[]): TypeValidator<A> {
//   return typeValidator(
//     (o) =>
//       args.includes(o)
//         ? valid(o)
//         : invalid(error(`must be one of ${args.join(", ")}`))
//   );
// }

export class AndValidator<
  PA extends boolean,
  A,
  PB extends boolean,
  B
> extends Validator<IsAsync<PA | PB>, A & B> {
  constructor(private left: Validator<PA, A>, private right: Validator<PB, B>) {
    super();
  }

  validate(value: any): Result<A & B> {
    return <Result<A & B>>(<any>this.left)
      .validate(value)
      .chain(() => (<any>this.right).validate(value));
  }

  async asyncValidate(value: any): Promise<Result<A & B>> {
    return (<any>this.left)
      .asyncValidate(value)
      .then((res) => (<any>this.right).asyncValidate(value));
  }
}

export function and<PA extends boolean, A, PB extends boolean, B>(
  left: Validator<PA, A>,
  right: Validator<PB, B>
): Validator<IsAsync<PA | PB>, A & B> {
  return new AndValidator(left, right);
}

export class OrValidator<
  PA extends boolean,
  A,
  PB extends boolean,
  B
> extends Validator<IsAsync<PA | PB>, A | B> {
  constructor(private left: Validator<PA, A>, private right: Validator<PB, B>) {
    super();
  }

  validate(value: any) {
    return (<any>this.left).validate(value).match({
      valid: (a) => valid(a),
      invalid: (l) =>
        (<any>this.right).validate(value).match({
          valid: (b) => valid(b),
          invalid: (r) => invalid<A | B>(orError(l, r))
        })
    });
  }

  async asyncValidate(value: any) {
    const lr = await (<any>this.left).asyncValidate(value);
    return lr.match({
      valid: async () => lr,
      invalid: async (le) => {
        const rr = await (<any>this.right).asyncValidate(value);
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
): Validator<IsAsync<PA | PB>, A | B> {
  return new OrValidator(left, right);
}

export class XOrValidator<
  PA extends boolean,
  A,
  PB extends boolean,
  B
> extends Validator<IsAsync<PA | PB>, A | B> {
  constructor(private left: Validator<PA, A>, private right: Validator<PB, B>) {
    super();
  }

  validate(value: any) {
    const lr = (<any>this.left).validate(value);
    const rr = (<any>this.right).validate(value);
    if (lr.result.valid) {
      if (!rr.result.valid) {
        return lr;
      }
      return invalid<A | B>(error("must not satisfy both conditions"));
    } else if (rr.result.valid) {
      return rr;
    }
    return invalid<A | B>(orError(lr.result.error, rr.result.error));
  }

  async asyncValidate(value: any) {
    const lr = await (<any>this.left).asyncValidate(value);
    return lr.match({
      valid: async () => lr,
      invalid: async (le) => {
        const rr = await (<any>this.right).asyncValidate(value);
        return rr.match({
          valid: () => rr,
          invalid: (re) => invalid<A | B>(orError(le, re))
        });
      }
    });
  }
}
export function xor<PA extends boolean, A, PB extends boolean, B>(
  left: Validator<PA, A>,
  right: Validator<PB, B>
): Validator<IsAsync<PA | PB>, A | B> {
  return new XOrValidator(left, right);
}
