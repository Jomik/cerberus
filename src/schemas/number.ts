import { test, valid, invalid } from "../utils";
import { BaseSchema } from "./base";
import { SchemaTest } from "../types";
import { TypeError, ConstraintError } from "../errors";

export class NumberSchema<A extends number> extends BaseSchema<A> {
  constructor(
    validate: SchemaTest<A> = (obj) => {
      if (typeof obj === "number") {
        return valid(obj);
      } else if (typeof obj === "string") {
        const n = parseFloat(obj);
        if (!isNaN(n) && isFinite(n)) {
          return valid(n);
        }
      }
      return invalid(new TypeError(obj, "number"));
    }
  ) {
    super(validate);
  }

  /**
   * Require the number to be greater than n
   * @param n The bound
   */
  gt(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj > n,
        () => new ConstraintError(obj, `be greater than ${n}`)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be greater than or equal to n
   * @param n The bound
   */
  ge(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj >= n,
        () => new ConstraintError(obj, `be greater than or equal to ${n}`)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be equal to n
   * @param n The bound
   */
  eq(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj === n,
        () => new ConstraintError(obj, `be equal to ${n}`)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be less than or equal ton
   * @param n The bound
   */
  le(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj <= n,
        () => new ConstraintError(obj, `be less than or equal to ${n}`)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be less than n
   * @param n The bound
   */
  lt(n: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj < n,
        () => new ConstraintError(obj, `be less than ${n}`)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be between low and high, inclusive
   * @param low Low bound
   * @param high High bound
   */
  between(low: number, high: number): NumberSchema<A> {
    return this.chain<NumberSchema<A>>(
      test((obj) => [
        obj >= low && obj <= high,
        () => new ConstraintError(obj, `be between ${low} and ${high}`)
      ]),
      NumberSchema
    );
  }
}
