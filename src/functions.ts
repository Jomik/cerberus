import { TypeValidator, typeValidator } from "./validator";
import { valid, Result } from "./result";
import { Id } from "./types";

export function or<A, B>(
  left: TypeValidator<A>,
  right: TypeValidator<B>
): TypeValidator<A | B> {
  return typeValidator((o) =>
    left.validate(o).match<Result<A | B>>({
      valid: (a) => valid(a),
      invalid: () => right.validate(o)
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
