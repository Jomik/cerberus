import {
  TypeValidator,
  typeValidator,
  BaseValidator,
  baseValidator
} from "./validator";
import { valid, Result, invalid } from "./result";
import { Id } from "./types";
import { error, orError } from ".";

export function is<A>(a: A): BaseValidator<A> {
  return baseValidator(
    (o) => (o === a ? valid(o) : invalid(error(`must be ${a}`)))
  );
}

export function oneOf<A, B, C>(...args: [A, B, C][]): BaseValidator<[A, B, C]>;
export function oneOf<A, B>(...args: [A, B][]): BaseValidator<[A, B]>;
export function oneOf<A extends string>(...args: A[]): BaseValidator<A>;
export function oneOf<A extends number>(...args: A[]): BaseValidator<A>;
export function oneOf<A>(...args: A[]): BaseValidator<A>;
export function oneOf<A>(...args: A[]): BaseValidator<A> {
  return baseValidator(
    (o) =>
      args.includes(o)
        ? valid(o)
        : invalid(error(`must be one of ${args.join(", ")}`))
  );
}

export function or<A, B>(
  left: TypeValidator<A>,
  right: TypeValidator<B>
): TypeValidator<A | B> {
  return typeValidator((o) =>
    left.validate(o).match<Result<A | B>>({
      valid: (a) => valid(a),
      invalid: (l) =>
        right.validate(o).match<Result<A | B>>({
          valid: (b) => valid(b),
          invalid: (r) => invalid(orError(l, r))
        })
    })
  );
}

export function and<A extends object, B extends object>(
  left: TypeValidator<A>,
  right: TypeValidator<B>
): TypeValidator<Id<A & B>>;
export function and<A, B>(
  left: TypeValidator<A>,
  right: TypeValidator<B>
): TypeValidator<Id<A & B>>;
export function and<A, B>(
  left: TypeValidator<A>,
  right: TypeValidator<B>
): TypeValidator<Id<A & B>> {
  return typeValidator((o: any) =>
    left.validate(o).chain((a) => right.validate.bind(right)(o))
  );
}

export function xor<A, B>(
  left: TypeValidator<A>,
  right: TypeValidator<B>
): TypeValidator<A> | TypeValidator<B> {
  return typeValidator((o: any) => {
    const lr = left.validate(o);
    const lRes = lr.result;
    const rr = right.validate(o);
    const rRes = rr.result;

    if (lRes.valid) {
      if (!rRes.valid) {
        return lr;
      }
    } else if (rRes.valid) {
      return rr;
    } else {
      return invalid(orError(lRes.error, rRes.error));
    }
    return invalid(error("must not satisfy both conditions"));
  });
}
