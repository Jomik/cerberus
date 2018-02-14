import { test } from "../utils";
import { BaseSchema } from "./base";
import { SchemaTest, ChainMethod } from "../types";
import { TypeError, ConstraintError, MissingError } from "../errors";
import { NumericProperty } from "../constraints/property";

export class StringSchema extends BaseSchema<string> {
  get length(): NumericProperty<string, StringSchema> {
    return new NumericProperty<string, StringSchema>(
      "length",
      this.chain.bind(this),
      StringSchema
    );
  }

  constructor(
    validate: SchemaTest<string> = test((obj: any) => [
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
  includes(str: string): StringSchema {
    return this.chain<StringSchema>(
      test((obj) => [
        obj.includes(str),
        () => new ConstraintError(obj, `include ${str}`, "includes", str)
      ]),
      StringSchema
    );
  }
}
