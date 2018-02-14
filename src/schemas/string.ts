import { test } from "../utils";
import { BaseSchema } from "./base";
import { SchemaTest, ChainMethod } from "../types";
import { TypeError, ConstraintError, MissingError } from "../errors";
import { NumericProperty } from "../constraints/property";

export class StringSchema<A extends string> extends BaseSchema<A> {
  get length(): NumericProperty<A, StringSchema<A>> {
    return new NumericProperty<A, StringSchema<A>>(
      "length",
      this.chain.bind(this),
      StringSchema
    );
  }

  constructor(
    validate: SchemaTest<any> = test((obj) => [
      typeof obj === "string",
      () =>
        obj === undefined ? new MissingError(obj) : new TypeError(obj, "string")
    ])
  ) {
    super(validate);
  }

  /**
   * Require the string to include str
   * @param str The required string
   */
  includes(str: string): StringSchema<A> {
    return this.chain<StringSchema<A>>(
      test((obj) => [
        obj.includes(str),
        () => new ConstraintError(obj, `include ${str}`)
      ]),
      StringSchema
    );
  }
}
