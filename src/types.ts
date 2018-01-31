export type SchemaError<A> = (obj: A) => string;

export type SchemaResult<A> =
  | { valid: true; obj: A }
  | { valid: false; obj: A; errors: SchemaError<any>[] };

export type SchemaTest<A, B> = (obj: A) => SchemaResult<B>;
