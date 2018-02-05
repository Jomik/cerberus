import { BaseSchema, Schema } from "./base";
import { test, invalid, mergeResults, valid, stringify } from "../utils";
import { TypeError, ConstraintError } from "../errors";
import {
  InvalidResult,
  ValidationResult,
  SchemaTest,
  SchemaConstructor
} from "../types";
import { NumericProperty } from "../constraints/property";
import * as equal from "fast-deep-equal";

export class ArraySchema<A> extends BaseSchema<A[]> {
  constructor(arg: SchemaTest<A[]> | Schema<A>) {
    if (arg instanceof Schema) {
      super((obj, path) => {
        if (Array.isArray(obj)) {
          const arr: A[] = [];
          const results = obj.map((e) => arg.validate(e));
          return results.reduce(
            (acc, cur, index) => {
              if (cur.valid) {
                arr[index] = cur.obj;
                return acc;
              } else {
                const result = acc.valid
                  ? cur
                  : invalid(path, ...acc.errors.concat(cur.errors));
                cur.errors.forEach((e) => e.path.unshift(index));
                return result;
              }
            },
            valid<A[]>(arr) as ValidationResult<A[]>
          );
        } else {
          return invalid(path, new TypeError(obj, "array"));
        }
      });
    } else {
      super(arg);
    }
  }

  get length(): NumericProperty<A[], ArraySchema<A>> {
    return new NumericProperty<A[], ArraySchema<A>>(
      "length",
      this.chain.bind(this),
      ArraySchema
    );
  }

  /**
   * Require that some element satisfies predicate
   * @param predicate The predicate to satisfy
   * @param description A description of the predicate, prefixed "must "
   */
  some(
    predicate: (element: A) => boolean,
    description: string
  ): ArraySchema<A> {
    return this.chain<ArraySchema<A>>(
      test((obj) => [
        obj.some(predicate),
        () => new ConstraintError(obj, description)
      ]),
      ArraySchema
    );
  }

  /**
   * Require the array to include object
   * @param element The object to include
   */
  includes(element: A): ArraySchema<A> {
    return this.some((e) => equal(e, element), `include ${stringify(element)}`);
  }
}
