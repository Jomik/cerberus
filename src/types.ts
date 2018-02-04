import { ValidationError } from "./errors";
import { Schema } from "./schemas/base";

export type SchemaConstructor<A, B extends Schema<A>> = new (
  internalValidate: SchemaTest<A>
) => B;
export type ChainMethod<A, B extends Schema<A>> = (
  next: SchemaTest<A>,
  ctor: SchemaConstructor<A, B>
) => B;
export type SchemaTest<A> = (obj: A, path?: string) => ValidationResult<A>;

export type ValidResult<A> = { valid: true; obj: A };
export type InvalidResult = { valid: false; errors: ValidationError[] };
export type ValidationResult<A> = ValidResult<A> | InvalidResult;
