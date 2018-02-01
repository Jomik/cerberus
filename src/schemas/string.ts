import { test, error } from "../utils";
import { Schema } from "./schema";
import { SchemaTest } from "../types";

export class StringSchema<A extends string> extends Schema<A> {
  get length(): StringLength<A> {
    return new StringLength(this.chain.bind(this));
  }

  constructor(
    internalValidate: SchemaTest<any> = test(
      (obj) => typeof obj === "string",
      error`is not a string`
    )
  ) {
    super(internalValidate);
  }
}

export class StringLength<A extends string> {
  constructor(private chain) {}
  gt(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length > n, error`'s length is not greater than ${n}`),
      StringSchema
    );
  }
  ge(n: number): StringSchema<A> {
    return this.chain(
      test(
        (obj) => obj.length >= n,
        error`'s length is not greater than or equal to ${n}`
      ),
      StringSchema
    );
  }
  eq(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length === n, error`'s length is not equal to ${n}`),
      StringSchema
    );
  }
  le(n: number): StringSchema<A> {
    return this.chain(
      test(
        (obj) => obj.length <= n,
        error`'s length is not less than or equal to ${n}`
      ),
      StringSchema
    );
  }
  lt(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length < n, error`'s length is not less than ${n}`),
      StringSchema
    );
  }
}
