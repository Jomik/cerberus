import { test } from "../utils";
import { Schema } from "./base";
import { SchemaTest } from "../types";
import { TypeError, ConstraintError } from "../errors";

export class NumberSchema<A extends number> extends Schema<A> {
  constructor(
    validate: SchemaTest<A> = test((obj) => [
      typeof obj === "number",
      () => [new TypeError(obj, "number")]
    ])
  ) {
    super(validate);
  }

  gt(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj > n,
        () => [new ConstraintError(obj, `be greater than ${n}`)]
      ]),
      NumberSchema
    );
  }
  ge(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj >= n,
        () => [new ConstraintError(obj, `be greater than or equal to ${n}`)]
      ]),
      NumberSchema
    );
  }
  eq(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj === n,
        () => [new ConstraintError(obj, `be equal to ${n}`)]
      ]),
      NumberSchema
    );
  }
  le(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj <= n,
        () => [new ConstraintError(obj, `be less than or equal to ${n}`)]
      ]),
      NumberSchema
    );
  }
  lt(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj < n,
        () => [new ConstraintError(obj, `be less than ${n}`)]
      ]),
      NumberSchema
    );
  }
  between(low: number, high: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj >= low && obj <= high,
        () => [new ConstraintError(obj, `be between ${low} and ${high}`)]
      ]),
      NumberSchema
    );
  }
}
