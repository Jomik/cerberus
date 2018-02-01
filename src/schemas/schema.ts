import { SchemaTest, ValidationResult } from "../types";
import { mergeResults, valid, test } from "../utils";
import { ConstraintError } from "../errors";

export class Schema<A> {
  constructor(protected internalValidate: SchemaTest<A>) {}

  validate(obj: any): ValidationResult<A> {
    return this.internalValidate(obj);
  }

  protected chain<B extends Schema<A>>(
    next,
    ctor: new (internalValidate: SchemaTest<A>) => B
  ): B {
    return new ctor((obj, path) => {
      const result1 = this.internalValidate(obj, path);
      const result2 = result1.valid ? next(result1.obj, path) : next(obj, path);
      return mergeResults(result1, result2);
    });
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
