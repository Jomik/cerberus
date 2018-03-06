import { AnyType } from "./types/any";
import { StringType } from "./types/string";
import { NumberType } from "./types/number";
import { ObjectType, ObjectSchema } from "./types/object";
import { BaseType } from "./types/base";
import { ValidationResult } from "./types";
import { ArrayType } from "./types/array";
import { BooleanType } from "./types/boolean";
import { DateType } from "./types/date";
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
export const integer = new NumberType().integer();
export const boolean = new BooleanType();
export const date = new DateType();

export function array<A>(schema: BaseType<A>): ArrayType<A> {
  return new ArrayType<A>(schema);
}
export function object<A extends object>(
  specification: ObjectSchema<A>
): ObjectType<A> {
  return new ObjectType(undefined, specification);
}
export function thru<B>(process: (obj: any) => B) {
  return new AnyType().thru(process);
}
