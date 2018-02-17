import { test } from "../utils";
import { BaseType } from "./base";
import { TypeTest, ChainMethod } from "../types";
import { TypeError, ConstraintError, MissingError } from "../errors";
import { NumericProperty } from "../constraints/property";

export class StringType extends BaseType<string> {
  get length(): NumericProperty<string, StringType> {
    return new NumericProperty<string, StringType>(
      "length",
      this.chain.bind(this),
      StringType
    );
  }

  constructor(
    validate: TypeTest<string> = test((obj: any) => [
      typeof obj === "string",
      () =>
        obj === undefined ? new MissingError(obj) : new TypeError(obj, "string")
    ])
  ) {
    super(validate);
  }

  /**
   * Require the string to match exp
   * @param exp The expression to test against
   */
  matches(exp: RegExp): StringType {
    return this.chain<StringType>(
      test((obj) => [
        exp.test(obj),
        () =>
          new ConstraintError(
            obj,
            `match regular expression ${exp}`,
            "regex",
            exp
          )
      ]),
      StringType
    );
  }

  /**
   * Require the string to be alphanumeric
   */
  alphanum(): StringType {
    return this.matches(/^[A-Z0-9]*$/i);
  }

  /**
   * Require the string to be an email
   */
  email(): StringType {
    return this.matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
  }

  /**
   * Require the string to include str
   * @param str The required string
   */
  includes(str: string): StringType {
    return this.chain<StringType>(
      test((obj) => [
        obj.includes(str),
        () => new ConstraintError(obj, `include ${str}`, "includes", str)
      ]),
      StringType
    );
  }
}
