import { SchemaTest, ValidationResult } from "../types";
import { mergeResults, valid } from "../utils";

export class Schema<A> {
  constructor(protected internalValidate: SchemaTest<A>) {}

  validate(obj: any): ValidationResult<A> {
    const name =
      obj !== null && typeof obj === "object" && !Array.isArray(obj)
        ? "<root>"
        : JSON.stringify(obj);
    return this.internalValidate(obj, name);
  }

  protected chain<B extends Schema<A>>(
    next,
    ctor?: new (validate: SchemaTest<A>) => B
  ): Schema<A> {
    return new (ctor || Schema)((obj, path) =>
      mergeResults(this.internalValidate(obj, path), next(obj))
    );
  }

  optional(): Schema<A | undefined> {
    return new Schema(
      (obj) => (obj === undefined ? valid(undefined) : this.validate(obj))
    );
  }

  default<B>(value: B): Schema<A | B> {
    return new Schema(
      (obj) => (obj === undefined ? valid(value) : this.validate(obj))
    );
  }
}
