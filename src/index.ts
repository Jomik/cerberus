import { AnySchema } from "./schemas/any";
import { StringSchema } from "./schemas/string";
import { NumberSchema } from "./schemas/number";
import { ObjectSchema, ObjectSpecification } from "./schemas/object";
import { Schema } from "./schemas/base";
import { ValidationResult } from "./types";
import { ArraySchema } from "./schemas/array";
export * from "./functions";
// tslint:disable:variable-name

export function validate<A>(schema: Schema<A>, obj: any): ValidationResult<A> {
  return schema.validate(obj);
}

export const any = new AnySchema();
export const string = new StringSchema();
export const number = new NumberSchema();

export function array<A>(schema: Schema<A>) {
  return new ArraySchema().of(schema);
}
export function object<A extends object>(
  specification: ObjectSpecification<A>
) {
  return new ObjectSchema().of(specification);
}
