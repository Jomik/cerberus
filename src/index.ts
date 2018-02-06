import { AnySchema } from "./schemas/any";
import { StringSchema } from "./schemas/string";
import { NumberSchema } from "./schemas/number";
import { ObjectSchema, ObjectSpecification } from "./schemas/object";
import { BaseSchema } from "./schemas/base";
import { ValidationResult } from "./types";
import { ArraySchema } from "./schemas/array";
export * from "./functions";
// tslint:disable:variable-name

export function validate<A>(
  schema: BaseSchema<A>,
  obj: any
): ValidationResult<A> {
  return schema.validate(obj);
}

export const any = new AnySchema();
export const string = new StringSchema();
export const number = new NumberSchema();

export function array<A>(schema: BaseSchema<A>) {
  return new ArraySchema(schema);
}
export function object<A extends object>(
  specification: ObjectSpecification<A>
) {
  return new ObjectSchema(undefined, specification);
}
