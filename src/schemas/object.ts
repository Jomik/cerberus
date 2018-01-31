import * as _ from "lodash";
import { test, mergeResults } from "../utils";
import { AnySchema } from "./any";
import { SchemaResult } from "../types";
import { Schema } from "./schema";

export type ObjectSpecification<A extends object> = {
  [k in keyof A]: Schema<A[k]>
};

export class ObjectSchema<A extends object> extends AnySchema<A> {
  constructor(spec: ObjectSpecification<A>) {
    super((obj) => {
      let error = false;
      let result: SchemaResult<A> = { valid: true, obj };
      for (const key in spec) {
        if (spec.hasOwnProperty(key)) {
          const element = obj[key];
          try {
            const res = spec[key].validate(element);
            if (!res.valid) {
              const errors = _.map(res.errors, (e) => (n) =>
                e(`${obj}.${key}`)
              );
              result = {
                valid: false,
                obj: element,
                errors: result.valid ? errors : _.concat(result.errors, errors)
              };
            } else {
              result.obj = _.merge({ [key]: res.obj }, result.obj);
            }
          } catch (res) {
            error = true;
            const errors = _.map(res.errors, (e) => (n) => e(`${n}.${key}`));
            result = {
              valid: false,
              obj: element,
              errors: result.valid ? errors : _.concat(result.errors, errors)
            };
          }
        }
      }
      if (error) {
        throw result;
      }
      return result;
    });
  }
}
