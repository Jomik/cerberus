import { SchemaTest, ValidationResult, SchemaConstructor } from "../types";
import { mergeResults, valid } from "../utils";

export class Schema<A> {
  constructor(protected internalValidate: SchemaTest<A>) {}

  /**
   * Validate object against schema
   * @param obj The object to validate
   */
  validate(object: any): ValidationResult<A> {
    return this.internalValidate(object);
  }
}

export class BaseSchema<A> extends Schema<A> {
  constructor(internalValidate: SchemaTest<A>) {
    super(internalValidate);
  }

  protected chain<B extends BaseSchema<A>>(
    next: SchemaTest<A>,
    ctor: SchemaConstructor<A, B>,
    ...args: any[]
  ): B {
    return new ctor((obj) => {
      const result1 = this.validate(obj);
      if (!result1.valid && result1.errors.some((e) => e.fatal)) {
        return result1;
      }
      const result2 = result1.valid ? next(result1.obj) : next(obj);
      return mergeResults(result1, result2);
    }, ...args);
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
