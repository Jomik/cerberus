import { test, mergeResults, internalOr } from "../utils";
import { Schema } from "./any";

export class StringSchema<A extends string> extends Schema<A> {
  get length(): StringLength<A> {
    return new StringLength(this);
  }

  constructor(
    validate = test<A>(
      (obj) => typeof obj === "string",
      (name) => `${name} is not a string`
    )
  ) {
    super(validate);
  }

  or<B extends string>(other: StringSchema<B>): StringSchema<A | B>;
  or<B>(other: Schema<B>): Schema<A | B>;
  or<B>(other: Schema<B>) {
    return internalOr(this, other, StringSchema as any);
  }
}

export class StringLength<A extends string> {
  constructor(private schema: StringSchema<A>) {}
  min(n: number): StringSchema<A> {
    return new StringSchema(
      test(
        (obj) => this.schema.validate(obj) && obj.length >= n,
        (name) => `${name} is not larger than length ${n}`
      )
    );
  }
  exactly(n: number): StringSchema<A> {
    return new StringSchema(
      test(
        (obj) => obj.length === n,
        (name) => `${name} is not of length ${n}`,
        this.schema
      )
    );
  }
  max(n: number): StringSchema<A> {
    return new StringSchema(
      test(
        (obj) => obj.length <= n,
        (name) => `${name} is not less than length ${n}`,
        this.schema
      )
    );
  }
}
