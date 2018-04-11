import { TypeValidator, typeValidator } from "./validator";
import { valid, Result, invalid } from "./result";
import { Id } from "./types";
import { error, orError } from ".";

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
