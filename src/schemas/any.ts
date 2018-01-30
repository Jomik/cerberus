import { test, mergeResults } from "../utils";
import { SchemaResult } from "../types";

export class Schema<A = any> {
  constructor(
    public validate: (obj: any) => SchemaResult<A> = test<A>(
      (obj) => obj !== undefined,
      (name) => `${name} can not be undefined`
    )
  ) {}

  optional(): Schema<A | undefined> {
    return this.or<undefined>(
      new Schema<undefined>(test((obj) => obj === undefined))
    );
  }

  oneOf<B extends A>(...args: B[]): Schema<B> {
    return new Schema<B>(undefined as any);
  }

  or<B>(other: Schema<B>): Schema<A | B> {
    return new Schema<A | B>((obj: any) => {
      const result1 = this.validate(obj);
      if (result1.valid) {
        return result1;
      } else {
        const result2 = other.validate(obj);
        if (result2.valid) {
          return result2;
        }
        return mergeResults(result1, result2);
      }
    });
  }
}
