import { AnyType } from "./types/any";
import { StringType } from "./types/string";
import { NumberType } from "./types/number";
import { ObjectType, ObjectSchema } from "./types/object";
import { BaseType } from "./types/base";
import { ValidationResult } from "./types";
import { ArrayType } from "./types/array";
import { BooleanType } from "./types/boolean";
export * from "./functions";
// tslint:disable:variable-name

export function validate<A>(
  schema: BaseType<A>,
  obj: any
): ValidationResult<A> {
  return schema.validate(obj);
}

export const any = new AnyType();
export const string = new StringType();
export const number = new NumberType();
export const boolean = new BooleanType();

export function array<A>(schema: BaseType<A>): ArrayType<A> {
  return new ArrayType<A>(schema);
}
export function object<A extends object>(
  specification: ObjectSchema<A>
): ObjectType<A> {
  return new ObjectType(undefined, specification);
}
