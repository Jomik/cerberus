import { test } from "../utils";
import { AnySchema } from "./any";
import { SchemaTest } from "../types";

export class StringSchema<A extends string> extends AnySchema<A> {
  get length(): StringLength<A> {
    return new StringLength(this);
  }

  constructor(
    validate: SchemaTest<any, A> = test(
      (obj) => typeof obj === "string",
      (obj) => `${obj} is not a string`
    )
  ) {
    super(validate);
  }
}

export class StringLength<A extends string> {
  constructor(private schema: StringSchema<A>) {}
  min(n: number): StringSchema<A> {
    return new StringSchema(
      test(
        (obj) => obj.length >= n,
        (obj) => `${obj} is not larger than length ${n}`,
        this.schema
      )
    );
  }
  exact(n: number): StringSchema<A> {
    return new StringSchema(
      test(
        (obj) => obj.length === n,
        (obj) => `${obj} is not of length ${n}`,
        this.schema
      )
    );
  }
  max(n: number): StringSchema<A> {
    return new StringSchema(
      test(
        (obj) => obj.length <= n,
        (obj) => `${obj} is not less than length ${n}`,
        this.schema
      )
    );
  }
}
