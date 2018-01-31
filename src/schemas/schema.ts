import { SchemaTest } from "../types";
import { mergeResults, valid } from "../utils";

export class Schema<A> {
  constructor(public validate: SchemaTest<A>) {}

  protected chain<B extends Schema<A>>(
    next,
    ctor?: new (validate: SchemaTest<A>) => B
  ): Schema<A> {
    return new (ctor || Schema)((obj) =>
      mergeResults(this.validate(obj), next(obj))
    );
  }

  get optional(): Schema<A | undefined> {
    return new Schema(
      (obj) => (obj === undefined ? valid(undefined) : this.validate(obj))
    );
  }

  default<B>(value: B): Schema<A | B> {
    return new Schema(
      (obj) => (obj === undefined ? valid(value) : this.validate(obj))
    );
  }
}
