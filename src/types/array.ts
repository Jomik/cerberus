import { BaseType, Type } from "./base";
import { test, invalid, mergeResults, valid } from "../utils";
import { TypeError, ConstraintError, MissingError } from "../errors";
import {
  InvalidResult,
  ValidationResult,
  TypeTest,
  TypeConstructor
} from "../types";
import { NumericProperty } from "../constraints/property";
import * as equal from "fast-deep-equal";

export class ArrayType<A> extends BaseType<A[]> {
  get length(): NumericProperty<A[], ArrayType<A>> {
    return new NumericProperty<A[], ArrayType<A>>(
      (obj) => obj.length,
      "length",
      this.chain.bind(this),
      ArrayType
    );
  }

  satisfies: (
    predicate: (obj: A[]) => boolean,
    message: string,
    type: string
  ) => ArrayType<A>;

  constructor(arg: TypeTest<A[]> | Type<A>) {
    if (arg instanceof Type) {
      super((obj) => {
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
                  : invalid(...acc.errors.concat(cur.errors));
                cur.errors.forEach((e) => e.path.unshift(index));
                return result;
              }
            },
            valid<A[]>(arr) as ValidationResult<A[]>
          );
        } else {
          return invalid(
            obj === undefined
              ? new MissingError(obj)
              : new TypeError(obj, "array")
          );
        }
      });
    } else {
      super(arg);
    }
  }

  /**
   * Require that some element satisfies predicate
   * @param predicate The predicate to satisfy
   * @param description A description of the predicate, prefixed "must "
   */
  some(predicate: (element: A) => boolean, description: string): ArrayType<A> {
    return this.chain<ArrayType<A>>(
      test((obj) => [
        obj.some(predicate),
        () => new ConstraintError(obj, description, "some", predicate)
      ]),
      ArrayType
    );
  }

  /**
   * Require the array to include object
   * @param element The object to include
   */
  includes(element: A): ArrayType<A> {
    return this.chain<ArrayType<A>>(
      test((obj) => [
        obj.some((e) => equal(e, element)),
        () =>
          new ConstraintError(obj, `include ${element}`, "includes", element)
      ]),
      ArrayType
    );
  }
}
