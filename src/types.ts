import { ValidationError } from "./errors";
import { Schema } from "./schemas/base";

export type ChainMethod<A, B extends Schema<A>> = (
  next: SchemaTest<A>,
  ctor: new (internalValidate: SchemaTest<A>) => B
) => B;
export type SchemaTest<A> = (obj: A, path?: string) => ValidationResult<A>;

export type ValidResult<A> = { valid: true; obj: A };
export type InvalidResult = { valid: false; errors: ValidationError[] };
export type ValidationResult<A> = ValidResult<A> | InvalidResult;
