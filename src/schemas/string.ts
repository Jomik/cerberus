import { test } from "../utils";
import { Schema } from "./schema";
import { SchemaTest } from "../types";
import { TypeError, ConstraintError } from "../errors";

export class StringSchema<A extends string> extends Schema<A> {
  get length(): StringLength<A> {
    return new StringLength(this.chain.bind(this));
  }

  constructor(
    internalValidate: SchemaTest<any> = test((obj) => typeof obj === "string", [
      TypeError,
      "string"
    ])
  ) {
    super(internalValidate);
  }
}

export class StringLength<A extends string> {
  constructor(private chain) {}
  gt(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length > n, [
        ConstraintError,
        `greater than ${n}`,
        "length"
      ]),
      StringSchema
    );
  }
  ge(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length >= n, [
        ConstraintError,
        `greater than or equal to ${n}`,
        "length"
      ]),
      StringSchema
    );
  }
  eq(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length === n, [
        ConstraintError,
        `equal to ${n}`,
        "length"
      ]),
      StringSchema
    );
  }
  le(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length <= n, [
        ConstraintError,
        `less than or equal to ${n}`,
        "length"
      ]),
      StringSchema
    );
  }
  lt(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length < n, [
        ConstraintError,
        `less than ${n}`,
        "length"
      ]),
      StringSchema
    );
  }
}
