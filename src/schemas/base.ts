import { SchemaTest, ValidationResult } from "../types";
import { mergeResults, valid } from "../utils";

export class Schema<A> {
  constructor(protected internalValidate: SchemaTest<A>) {}

  /**
   * Validate object against schema
   * @param obj The object to validate
   */
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

  /**
   * Mark as optional
   */
  optional(): Schema<A | undefined> {
    return new Schema(
      (obj) => (obj === undefined ? valid(undefined) : this.validate(obj))
    );
  }

  /**
   * Set a default value to use in place of an undefined object
   * @param value The default value
   */
  default<B>(value: B): Schema<A | B> {
    return new Schema(
      (obj) => (obj === undefined ? valid(value) : this.validate(obj))
    );
  }
}
