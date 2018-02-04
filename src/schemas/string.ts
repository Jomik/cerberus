import { test } from "../utils";
import { Schema } from "./base";
import { SchemaTest, ChainMethod } from "../types";
import { TypeError, ConstraintError } from "../errors";
import { NumericProperty } from "../constraints/numericproperty";

export class StringSchema<A extends string> extends Schema<A> {
  get length(): NumericProperty<A, StringSchema<A>> {
    return new NumericProperty("length", this.chain.bind(this), StringSchema);
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
