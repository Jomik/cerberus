import { ValidationError } from "./errors";
import { BaseType, Type } from "./types/base";

export type TypeConstructor<A, B extends Type<A>> = new (
  internalValidate: TypeTest<A>,
  ...args: any[]
) => B;
export type ChainMethod<A, B extends BaseType<A>> = (
  next: TypeTest<A>,
  ctor: TypeConstructor<A, B>
) => B;
export type TypeTest<A> = (obj: A) => ValidationResult<A>;

export type ValidResult<A> = { valid: true; obj: A };
export type InvalidResult = { valid: false; errors: ValidationError[] };
export type ValidationResult<A> = ValidResult<A> | InvalidResult;
