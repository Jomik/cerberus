import { TypeTest, ValidationResult, TypeConstructor } from "../types";
import { mergeResults, valid, test } from "../utils";
import { ConstraintError } from "../errors";

export class Type<A> {
  constructor(protected internalValidate: TypeTest<A>) {}

  /**
   * Validate object against schema
   * @param obj The object to validate
   */
  validate(object: any): ValidationResult<A> {
    return this.internalValidate(object);
  }

  /**
   * Check if object satsifes the schema
   * @param object The object to check
   */
  check(object: any): object is A {
    return this.validate(object).valid;
  }

  /**
   * Test if the object satisfies schema
   * @param object the object to test
   * @throws ValidationError[]
   */
  test(object: any): A {
    const res = this.validate(object);
    if (res.valid) {
      return res.obj;
    } else {
      throw res.errors;
    }
  }
}

export class BaseType<A> extends Type<A> {
  satisfies: (
    predicate: (obj: A) => boolean,
    message: string,
    type: string
  ) => BaseType<A>;

  constructor(validate: TypeTest<A>) {
    super(validate);
  }

  protected chain<B extends Type<A>>(
    next: TypeTest<A>,
    ctor: TypeConstructor<A, B>
  ): B {
    return new ctor((obj) => {
      const result1 = this.validate(obj);
      if (!result1.valid && result1.errors.some((e) => e.fatal)) {
        return result1;
      }
      const result2 = result1.valid ? next(result1.obj) : next(obj);
      return mergeResults(result1, result2);
    });
  }

  private internalSatisfies<B extends Type<A>>(
    predicate: (obj: A) => boolean,
    message: string,
    type: string
  ): B {
    return this.chain<B>(
      test((obj) => [
        predicate(obj),
        () => new ConstraintError(obj, message, type)
      ]),
      Object.getPrototypeOf(this).constructor as TypeConstructor<A, B>
    );
  }

  thru<B>(process: (obj: A) => B): BaseType<B> {
    return new BaseType<B>((obj: any) => {
      const res = this.validate(obj);
      return res.valid ? valid(process(obj)) : res;
    });
  }

  and<B extends A>(schema: Type<B>) {
    return this.chain<BaseType<A & B>>(
      schema.validate.bind(schema),
      BaseType as TypeConstructor<A & B, BaseType<A & B>>
    );
  }

  /**
   * Mark as optional
   */
  optional(): Type<A | undefined> {
    return new Type(
      (obj) => (obj === undefined ? valid(undefined) : this.validate(obj))
    );
  }

  default<B extends number>(value: B): Type<A | B>;
  default<B extends string>(value: B): Type<A | B>;
  default<B>(value: B): Type<A | B>;
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

BaseType.prototype.satisfies = (BaseType.prototype as any).internalSatisfies;
