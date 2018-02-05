import { ChainMethod, SchemaConstructor } from "../types";
import { ConstraintError } from "../errors";
import { Schema } from "../schemas/base";
import { test } from "../utils";
export class NumericProperty<A, B extends Schema<A>> {
  constructor(
    private prop: string,
    private chain: ChainMethod<A, B>,
    private ctor: SchemaConstructor<A, B>
  ) {}

  /**
   * Require the property to be greater than n
   * @param n The bound
   */
  gt(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] > n,
        () => new ConstraintError(obj, `be greater than ${n}`, this.prop)
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
            this.prop
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
        () => new ConstraintError(obj, `be equal to ${n}`, this.prop)
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
          new ConstraintError(obj, `be less than or equal to ${n}`, this.prop)
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
        () => new ConstraintError(obj, `be less than ${n}`, this.prop)
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
          new ConstraintError(obj, `be between ${low} and ${high}`, this.prop)
      ]),
      this.ctor
    );
  }
}
