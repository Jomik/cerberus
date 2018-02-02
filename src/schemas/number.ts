import { test } from "../utils";
import { Schema } from "./schema";
import { SchemaTest } from "../types";
import { TypeError, ConstraintError } from "../errors";

export class NumberSchema<A extends number> extends Schema<A> {
  constructor(
    validate: SchemaTest<A> = test((obj) => typeof obj === "number", [
      TypeError,
      "number"
    ])
  ) {
    super(validate);
  }

  gt(n: number): NumberSchema<A> {
    return this.chain(
      test((obj) => obj > n, [ConstraintError, `greater than ${n}`]),
      NumberSchema
    );
  }
  ge(n: number): NumberSchema<A> {
    return this.chain(
      test((obj) => obj >= n, [
        ConstraintError,
        `greater than or equal to ${n}`
      ]),
      NumberSchema
    );
  }
  eq(n: number): NumberSchema<A> {
    return this.chain(
      test((obj) => obj === n, [ConstraintError, `equal to ${n}`]),
      NumberSchema
    );
  }
  le(n: number): NumberSchema<A> {
    return this.chain(
      test((obj) => obj <= n, [ConstraintError, `less than or equal to ${n}`]),
      NumberSchema
    );
  }
  lt(n: number): NumberSchema<A> {
    return this.chain(
      test((obj) => obj < n, [ConstraintError, `less than ${n}`]),
      NumberSchema
    );
  }
}
