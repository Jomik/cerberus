import { test, valid, invalid } from "../utils";
import { BaseSchema } from "./base";
import { SchemaTest } from "../types";
import { TypeError, ConstraintError, MissingError } from "../errors";

export class NumberSchema extends BaseSchema<number> {
  constructor(
    validate: SchemaTest<number> = (obj: any) => {
      if (typeof obj === "number") {
        return valid(obj);
      } else if (typeof obj === "string") {
        const n = parseFloat(obj);
        if (!isNaN(n) && isFinite(n)) {
          return valid(n);
        }
      }
      return invalid(
        obj === undefined ? new MissingError(obj) : new TypeError(obj, "number")
      );
    }
  ) {
    super(validate);
  }

  /**
   * Require the number to be an integer
   */
  integer(): NumberSchema {
    return this.chain<NumberSchema>(
      test((obj) => [
        Number.isInteger(obj),
        () => new ConstraintError(obj, "be an integer", "integer")
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be a multiple of n
   * @param n The base
   */
  multiple(n: number): NumberSchema {
    return this.chain<NumberSchema>(
      test((obj) => [
        Number.isInteger(obj / n),
        () => new ConstraintError(obj, `be a multiple of ${n}`, "multiple", n)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be negative
   */
  negative(): NumberSchema {
    return this.lt(0);
  }

  /**
   * Require the number to be positive
   */
  positive(): NumberSchema {
    return this.gt(0);
  }

  /**
   * Require the number to be greater than n
   * @param n The bound
   */
  gt(n: number): NumberSchema {
    return this.chain<NumberSchema>(
      test((obj) => [
        obj > n,
        () => new ConstraintError(obj, `be greater than ${n}`, "gt", n)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be greater than or equal to n
   * @param n The bound
   */
  ge(n: number): NumberSchema {
    return this.chain<NumberSchema>(
      test((obj) => [
        obj >= n,
        () =>
          new ConstraintError(obj, `be greater than or equal to ${n}`, "ge", n)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be equal to n
   * @param n The bound
   */
  eq(n: number): NumberSchema {
    return this.chain<NumberSchema>(
      test((obj) => [
        obj === n,
        () => new ConstraintError(obj, `be equal to ${n}`, "eq", n)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be less than or equal ton
   * @param n The bound
   */
  le(n: number): NumberSchema {
    return this.chain<NumberSchema>(
      test((obj) => [
        obj <= n,
        () => new ConstraintError(obj, `be less than or equal to ${n}`, "le", n)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be less than n
   * @param n The bound
   */
  lt(n: number): NumberSchema {
    return this.chain<NumberSchema>(
      test((obj) => [
        obj < n,
        () => new ConstraintError(obj, `be less than ${n}`, "lt", n)
      ]),
      NumberSchema
    );
  }

  /**
   * Require the number to be between low and high, inclusive
   * @param low Low bound
   * @param high High bound
   */
  between(low: number, high: number): NumberSchema {
    return this.chain<NumberSchema>(
      test((obj) => [
        obj >= low && obj <= high,
        () =>
          new ConstraintError(obj, `be between ${low} and ${high}`, "between", [
            low,
            high
          ])
      ]),
      NumberSchema
    );
  }
}
