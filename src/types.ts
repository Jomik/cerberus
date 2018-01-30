export type SchemaError = (name: string) => string;

export type SchemaResult<A> =
  | { valid: true; obj: A }
  | { valid: false; errors: string[] };
