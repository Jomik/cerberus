export type SchemaError = (obj: any) => string;
export type SchemaTest<A> = (obj: any, path: string) => ValidationResult<A>;

export type ValidResult<A> = { valid: true; obj: A };
export type InvalidResult = { valid: false; errors: string[] };
export type ValidationResult<A> = ValidResult<A> | InvalidResult;
