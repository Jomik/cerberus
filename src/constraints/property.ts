import { ChainMethod, TypeConstructor } from "../types";
import { ConstraintError } from "../errors";
import { BaseType } from "../types/base";
import { test } from "../utils";
export class NumericProperty<A, B extends BaseType<A>> {
  constructor(
    private prop: string,
    private chain: ChainMethod<A, B>,
    private ctor: TypeConstructor<A, B>,
    private what: string = prop
  ) {}

  /**
   * Require the property to be greater than n
   * @param n The bound
   */
  gt(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] > n,
        () =>
          new ConstraintError(obj, `be greater than ${n}`, "gt", n, this.what)
      ]),
      this.ctor
    );
  }

  /**
   * Require the property to be greater than or equal to n
   * @param n The bound
   */
  ge(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] >= n,
        () =>
          new ConstraintError(
            obj,
            `be greater than or equal to ${n}`,
            "ge",
            n,
            this.what
          )
      ]),
      this.ctor
    );
  }

  /**
   * Require the property to be equal to n
   * @param n The bound
   */
  eq(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] === n,
        () => new ConstraintError(obj, `be equal to ${n}`, "eq", n, this.what)
      ]),
      this.ctor
    );
  }

  /**
   * Require the property to be less than or equal to n
   * @param n The bound
   */
  le(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] <= n,
        () =>
          new ConstraintError(
            obj,
            `be less than or equal to ${n}`,
            "le",
            n,
            this.what
          )
      ]),
      this.ctor
    );
  }

  /**
   * Require the property to be less than n
   * @param n The bound
   */
  lt(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] < n,
        () => new ConstraintError(obj, `be less than ${n}`, "lt", n, this.what)
      ]),
      this.ctor
    );
  }

  /**
   * Require the property to between low and high, inclusive
   * @param low Low bound
   * @param high High bound
   */
  between(low: number, high: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] >= low && obj[this.prop] <= high,
        () =>
          new ConstraintError(
            obj,
            `be between ${low} and ${high}`,
            "between",
            [low, high],
            this.what
          )
      ]),
      this.ctor
    );
  }
}
