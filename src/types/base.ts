import { TypeTest, ValidationResult, TypeConstructor } from "../types";
import { mergeResults, valid } from "../utils";

export class Type<A> {
  constructor(protected internalValidate: TypeTest<A>) {}

  /**
   * Validate object against schema
   * @param obj The object to validate
   */
  validate(object: any): ValidationResult<A> {
    return this.internalValidate(object);
  }
}

export class BaseType<A> extends Type<A> {
  constructor(internalValidate: TypeTest<A>) {
    super(internalValidate);
  }

  protected chain<B extends BaseType<A>>(
    next: TypeTest<A>,
    ctor: TypeConstructor<A, B>,
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
  optional(): Type<A | undefined> {
    return new Type(
      (obj) => (obj === undefined ? valid(undefined) : this.validate(obj))
    );
  }

  /**
   * Set a default value to use in place of an undefined object
   * @param value The default value
   */
  default<B>(value: B): Type<A | B> {
    return new Type(
      (obj) => (obj === undefined ? valid(value) : this.validate(obj))
    );
  }
}
