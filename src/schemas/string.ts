import { test } from "../utils";
import { Schema } from "./base";
import { SchemaTest, ChainMethod } from "../types";
import { TypeError, ConstraintError } from "../errors";

export class StringSchema<A extends string> extends Schema<A> {
  get length(): StringLength<A> {
    return new StringLength(this.chain.bind(this));
  }

  constructor(
    internalValidate: SchemaTest<any> = test((obj) => [
      typeof obj === "string",
      () => [new TypeError(obj, "string")]
    ])
  ) {
    super(internalValidate);
  }

  includes(str: string): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.includes(str),
        () => [new ConstraintError(obj, `include ${str}`)]
      ]),
      StringSchema
    );
  }
}

export class StringLength<A extends string> {
  constructor(private chain: ChainMethod<A, StringSchema<A>>) {}
  gt(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length > n,
        () => [new ConstraintError(obj, `be greater than ${n}`, "length")]
      ]),
      StringSchema
    );
  }
  ge(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length >= n,
        () => [
          new ConstraintError(obj, `be greater than or equal to ${n}`, "length")
        ]
      ]),
      StringSchema
    );
  }
  eq(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length === n,
        () => [new ConstraintError(obj, `be equal to ${n}`, "length")]
      ]),
      StringSchema
    );
  }
  le(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length <= n,
        () => [
          new ConstraintError(obj, `be less than or equal to ${n}`, "length")
        ]
      ]),
      StringSchema
    );
  }
  lt(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length < n,
        () => [new ConstraintError(obj, `be less than ${n}`, "length")]
      ]),
      StringSchema
    );
  }
}
