import { test } from "../utils";
import { SchemaResult, SchemaTest } from "../types";

export class Schema<A> {
  constructor(public validate: SchemaTest<any, A>) {}

  optional(): Schema<A | undefined> {
    return new Schema<A | undefined>((obj) => {
      if (obj === undefined) {
        return { valid: true, obj: undefined };
      } else {
        return this.validate(obj);
      }
    });
  }

  default(value: A): Schema<A> {
    return new Schema((obj) => {
      return obj === undefined
        ? { valid: true, obj: value }
        : this.validate(obj);
    });
  }
}
