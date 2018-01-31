import { test, error } from "../utils";
import { Schema } from "./schema";
import { SchemaTest } from "../types";

export class StringSchema<A extends string> extends Schema<A> {
  get length(): StringLength<A> {
    return new StringLength(this.chain.bind(this));
  }

  constructor(
    validate: SchemaTest<any> = test(
      (obj) => typeof obj === "string",
      error`is not a string`
    )
  ) {
    super(validate);
  }
}

export class StringLength<A extends string> {
  constructor(private chain) {}
  min(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length >= n, error`is not larger than length ${n}`),
      StringSchema
    );
  }
  exact(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length === n, error`is not of length ${n}`),
      StringSchema
    );
  }
  max(n: number): StringSchema<A> {
    return this.chain(
      test((obj) => obj.length <= n, error`is not less than length ${n}`),
      StringSchema
    );
  }
}
