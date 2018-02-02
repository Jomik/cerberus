import { test } from "../utils";
import { Schema, ChainMethod } from "./schema";
import { SchemaTest } from "../types";
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
}

export class StringLength<A extends string> {
  constructor(private chain: ChainMethod<A, StringSchema<A>>) {}
  gt(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length > n,
        () => [new ConstraintError(obj, `greater than ${n}`, "length")]
      ]),
      StringSchema
    );
  }
  ge(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length >= n,
        () => [
          new ConstraintError(obj, `greater than or equal to ${n}`, "length")
        ]
      ]),
      StringSchema
    );
  }
  eq(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length === n,
        () => [new ConstraintError(obj, `equal to ${n}`, "length")]
      ]),
      StringSchema
    );
  }
  le(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length <= n,
        () => [new ConstraintError(obj, `less than or equal to ${n}`, "length")]
      ]),
      StringSchema
    );
  }
  lt(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => [
        obj.length < n,
        () => [new ConstraintError(obj, `less than ${n}`, "length")]
      ]),
      StringSchema
    );
  }
}
