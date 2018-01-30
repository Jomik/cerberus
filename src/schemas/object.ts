import * as _ from "lodash";
import { test, mergeResults, internalOr } from "../utils";
import { Schema } from "./any";
import { SchemaResult } from "../types";

export type ObjectSpecification<A extends object> = {
  [k in keyof A]: Schema<A[k]>
};

export class ObjectSchema<A extends object> extends Schema<A> {
  constructor(spec: ObjectSpecification<A>) {
    super((obj, current: SchemaResult<A>) => {
      let result = current;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const element = obj[key];
          const res = spec[key].validate(element, current);
          if (!res.valid) {
            const errors = _.map(res.errors, (e) => `key ${key}: ${e}`);
            result = {
              valid: false,
              errors: result.valid ? errors : _.concat(result.errors, errors)
            };
          }
        }
      }
      return result;
    });
  }

  or<B extends object>(other: ObjectSchema<B>): ObjectSchema<A | B>;
  or<B>(other: Schema<B>): Schema<A | B>;
  or<B>(other: Schema<B>) {
    return internalOr(this, other, ObjectSchema as any);
  }
}
