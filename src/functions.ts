import { Validator } from "./validator";
import { Result, invalid, valid } from "./result";
import { orError, error } from "./errors";
import { Id } from "./types";

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

export class AndValidator<A, PB, B> extends Validator<Id<A & B>> {
  constructor(private left: Validator<A>, private right: Validator<B>) {
    super();
  }

  validate(value: any) {
    return <Result<Id<A & B>>>this.left
      .validate(value)
      .chain(() => this.right.validate(value));
  }
}

export function and<PA, A, PB, B>(
  left: Validator<A>,
  right: Validator<B>
): Validator<Id<A & B>> {
  return new AndValidator(left, right);
}

export class OrValidator<A, PB, B> extends Validator<A | B> {
  constructor(private left: Validator<A>, private right: Validator<B>) {
    super();
  }

  validate(value: any) {
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
export function or<PA, A, PB, B>(
  left: Validator<A>,
  right: Validator<B>
): Validator<A | B> {
  return new OrValidator(left, right);
}

export class XOrValidator<A, PB, B> extends Validator<A | B> {
  constructor(private left: Validator<A>, private right: Validator<B>) {
    super();
  }

  validate(value: any) {
    const lr = this.left.validate(value);
    const rr = this.right.validate(value);
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
export function xor<PA, A, PB, B>(
  left: Validator<A>,
  right: Validator<B>
): Validator<A | B> {
  return new XOrValidator(left, right);
}
