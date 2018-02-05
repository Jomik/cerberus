import { Schema } from "./base";
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

export class ArraySchema<A> extends Schema<A[]> {
  constructor(
    internalValidate: SchemaTest<A[]> = test((obj) => [
      Array.isArray(obj),
      () => new TypeError(obj, "array")
    ])
  ) {
    super(internalValidate);
  }

  of<B extends A>(schema: Schema<B>): ArraySchema<B> {
    return this.chain<ArraySchema<B>>(
      (obj, path) => {
        const arr: B[] = [];
        const results = obj.map((e) => schema.validate(e));
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
          valid<B[]>(arr) as ValidationResult<B[]>
        );
      },
      ArraySchema as SchemaConstructor<B[], ArraySchema<B>>
    );
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
