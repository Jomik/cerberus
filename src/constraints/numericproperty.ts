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
  gt(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] > n,
        () => [new ConstraintError(obj, `be greater than ${n}`, this.prop)]
      ]),
      this.ctor
    );
  }
  ge(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] >= n,
        () => [
          new ConstraintError(
            obj,
            `be greater than or equal to ${n}`,
            this.prop
          )
        ]
      ]),
      this.ctor
    );
  }
  eq(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] === n,
        () => [new ConstraintError(obj, `be equal to ${n}`, this.prop)]
      ]),
      this.ctor
    );
  }
  le(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] <= n,
        () => [
          new ConstraintError(obj, `be less than or equal to ${n}`, this.prop)
        ]
      ]),
      this.ctor
    );
  }
  lt(n: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] < n,
        () => [new ConstraintError(obj, `be less than ${n}`, this.prop)]
      ]),
      this.ctor
    );
  }
  between(low: number, high: number): B {
    return this.chain(
      test((obj) => [
        obj[this.prop] >= low && obj[this.prop] <= high,
        () => [
          new ConstraintError(obj, `be between ${low} and ${high}`, this.prop)
        ]
      ]),
      this.ctor
    );
  }
}
