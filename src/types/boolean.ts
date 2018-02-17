import { BaseType } from "./base";
import { TypeTest } from "../types";
import { TypeError } from "../errors";
import { test, valid } from "../utils";

export class BooleanType extends BaseType<boolean> {
  constructor(
    validate: TypeTest<boolean> = test((obj) => [
      typeof obj === "boolean",
      () => new TypeError(obj, "boolean")
    ])
  ) {
    super(validate);
  }

  /**
   * Allow these values as true
   * @param values The values that is to be perceived as true
   */
  truthy(...values: any[]): BooleanType {
    return new BooleanType((obj) => {
      if (values.includes(obj)) {
        return this.validate(true);
      } else {
        return this.validate(obj);
      }
    });
  }

  /**
   * Allow these values as false
   * @param values The values that is to be perceived as false
   */
  falsy(...values: any[]): BooleanType {
    return new BooleanType((obj) => {
      if (values.includes(obj)) {
        return this.validate(false);
      } else {
        return this.validate(obj);
      }
    });
  }
}
