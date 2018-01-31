import { AnySchema } from "./schemas/any";
import { StringSchema } from "./schemas/string";
import { NumberSchema } from "./schemas/number";
import { ObjectSchema, ObjectSpecification } from "./schemas/object";
import { Schema } from "./schemas/schema";
import { oneOf } from "./functions";
import { invalid } from "./utils";
import { SchemaResult, ValidationResult } from "./types";
export * from "./functions";
// tslint:disable:variable-name

export function validate<A>(schema: Schema<A>, obj: any): ValidationResult<A> {
  const result = schema.validate(obj);
  return result.valid
    ? result
    : {
        valid: false,
        errors: result.errors.map((e) =>
          e(
            obj !== null && typeof obj === "object" && !Array.isArray(obj)
              ? "<root>"
              : JSON.stringify(obj)
          )
        )
      };
}

export const any = new AnySchema();
export const string = new StringSchema();
export const number = new NumberSchema();
export function object<A extends object>(
  specification: ObjectSpecification<A>
) {
  return new ObjectSchema(specification);
}
