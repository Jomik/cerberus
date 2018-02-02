import { SchemaTest, ValidationResult } from "../types";
import { mergeResults, valid } from "../utils";

export type ChainMethod<A, B extends Schema<A>> = (
  next: SchemaTest<A>,
  ctor: new (internalValidate: SchemaTest<A>) => B
) => B;

export class Schema<A> {
  constructor(protected internalValidate: SchemaTest<A>) {}

  validate(obj: any): ValidationResult<A> {
    return this.internalValidate(obj);
  }

  protected chain<B extends Schema<A>>(
    next: SchemaTest<A>,
    ctor: new (internalValidate: SchemaTest<A>) => B
  ): B {
    return new ctor((obj, path) => {
      const result1 = this.internalValidate(obj, path);
      if (!result1.valid && result1.errors.some((e) => e.fatal)) {
        return result1;
      }
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
