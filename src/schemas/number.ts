import { test, mergeResults, internalOr } from "../utils";
import { Schema } from "./any";

export class NumberSchema<A extends number> extends Schema<A> {
  constructor(
    validate = test<A>(
      (obj) => typeof obj === "number",
      (name) => `${name} is not a number`
    )
  ) {
    super(validate);
  }

  or(other: NumberSchema<A>): NumberSchema<A>;
  or<B extends number>(other: Schema<B>): Schema<A | B>;
  or<B>(other: Schema<B>) {
    return internalOr(this, other, NumberSchema as any);
  }
}
