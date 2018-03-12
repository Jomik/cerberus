import { test, valid, invalid } from "../utils";
import { BaseType } from "./base";
import { TypeTest } from "../types";
import { TypeError, ConstraintError, MissingError } from "../errors";

export class NumberType extends BaseType<number> {
  satisfies: (
    predicate: (obj: number) => boolean,
    message: string,
    type: string
  ) => NumberType;

  constructor(
    validate: TypeTest<number> = (obj: any) => {
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
  integer(): NumberType {
    return this.chain<NumberType>(
      test((obj) => [
        Number.isInteger(obj),
        () => new ConstraintError(obj, "be an integer", "integer")
      ]),
      NumberType
    );
  }

  /**
   * Require the number to be a multiple of n
   * @param n The base
   */
  multiple(n: number): NumberType {
    return this.chain<NumberType>(
      test((obj) => [
        Number.isInteger(obj / n),
        () => new ConstraintError(obj, `be a multiple of ${n}`, "multiple", n)
      ]),
      NumberType
    );
  }

  /**
   * Require the number to be negative
   */
  negative(): NumberType {
    return this.lt(0);
  }

  /**
   * Require the number to be positive
   */
  positive(): NumberType {
    return this.gt(0);
  }

  /**
   * Require the number to be greater than n
   * @param n The bound
   */
  gt(n: number): NumberType {
    return this.chain<NumberType>(
      test((obj) => [
        obj > n,
        () => new ConstraintError(obj, `be greater than ${n}`, "gt", n)
      ]),
      NumberType
    );
  }

  /**
   * Require the number to be greater than or equal to n
   * @param n The bound
   */
  ge(n: number): NumberType {
    return this.chain<NumberType>(
      test((obj) => [
        obj >= n,
        () =>
          new ConstraintError(obj, `be greater than or equal to ${n}`, "ge", n)
      ]),
      NumberType
    );
  }

  /**
   * Require the number to be equal to n
   * @param n The bound
   */
  eq(n: number): NumberType {
    return this.chain<NumberType>(
      test((obj) => [
        obj === n,
        () => new ConstraintError(obj, `be equal to ${n}`, "eq", n)
      ]),
      NumberType
    );
  }

  /**
   * Require the number to be less than or equal ton
   * @param n The bound
   */
  le(n: number): NumberType {
    return this.chain<NumberType>(
      test((obj) => [
        obj <= n,
        () => new ConstraintError(obj, `be less than or equal to ${n}`, "le", n)
      ]),
      NumberType
    );
  }

  /**
   * Require the number to be less than n
   * @param n The bound
   */
  lt(n: number): NumberType {
    return this.chain<NumberType>(
      test((obj) => {
        return [
          obj < n,
          () => new ConstraintError(obj, `be less than ${n}`, "lt", n)
        ];
      }),
      NumberType
    );
  }

  /**
   * Require the number to be between low and high, inclusive
   * @param low Low bound
   * @param high High bound
   */
  between(low: number, high: number): NumberType {
    return this.chain<NumberType>(
      test((obj) => [
        obj >= low && obj <= high,
        () =>
          new ConstraintError(obj, `be between ${low} and ${high}`, "between", [
            low,
            high
          ])
      ]),
      NumberType
    );
  }
}
