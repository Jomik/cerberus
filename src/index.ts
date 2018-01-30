import { Schema } from "./schemas/any";
import { StringSchema } from "./schemas/string";
import { NumberSchema } from "./schemas/number";
import { test } from "./utils";
import { ObjectSchema, ObjectSpecification } from "./schemas/object";
import { SchemaResult } from "./types";

// tslint:disable-next-line:no-shadowed-variable
export function validate<A>(schema: Schema<A>, obj: any): SchemaResult<A> {
  return schema.validate(obj, { valid: true, obj });
}

export const schema = {
  any() {
    return new Schema<any>();
  },
  oneOf<A>(...args: A[]) {
    return new Schema<A>().oneOf(...args);
  },
  string<A extends string>(str?: A) {
    return new StringSchema<A>(
      str !== undefined
        ? test<A>((obj) => obj === str, (name) => `$name isn't ${str}`)
        : undefined
    );
  },
  number<A extends number>(num?: A) {
    return new NumberSchema(
      num !== undefined
        ? test<A>((obj) => obj === num, (name) => `$name isn't ${num}`)
        : undefined
    );
  },
  object<A extends object>(specification: ObjectSpecification<A>) {
    return new ObjectSchema(specification);
  }
};
