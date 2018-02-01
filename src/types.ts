import { ValidationError } from "./errors";

export type SchemaTest<A> = (obj: any, path?: string) => ValidationResult<A>;

export type ValidResult<A> = { valid: true; obj: A };
export type InvalidResult = { valid: false; errors: ValidationError[] };
export type ValidationResult<A> = ValidResult<A> | InvalidResult;
