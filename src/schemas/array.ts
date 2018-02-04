import { Schema } from "./base";
import { test, invalid, mergeResults, valid } from "../utils";
import { TypeError } from "../errors";
import { InvalidResult, ValidationResult } from "../types";

export class ArraySchema<A> extends Schema<A[]> {
  constructor(schema: Schema<A>) {
    super((testObj, path) => {
      if (Array.isArray(testObj)) {
        const arr: A[] = [];
        const results = testObj.map((e) => schema.validate(e));
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
      }
      return invalid(path, new TypeError(testObj, "array"));
    });
  }
}
