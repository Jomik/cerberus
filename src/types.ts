export type SchemaError = (obj: any) => string;
export type SchemaTest<A> = (obj: any) => SchemaResult<A>;

export type ValidSchemaResult<A> = { valid: true; obj: A };
export type InvalidSchemaResult = { valid: false; errors: SchemaError[] };
export type SchemaResult<A> = ValidSchemaResult<A> | InvalidSchemaResult;

export type ValidResult<A> = { valid: true; obj: A };
export type InvalidResult = { valid: false; errors: string[] };
export type ValidationResult<A> = ValidResult<A> | InvalidResult;
