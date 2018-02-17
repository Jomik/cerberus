import * as equal from "fast-deep-equal";
import { BaseSchema, Schema } from "./schemas/base";
import { test, valid, invalid } from "./utils";
import { string, number } from "./index";
import {
  ValueError,
  MissingError,
  ValidationError,
  AlternativesError
} from "./errors";

export function oneOf<A extends string>(a: A, ...rest: A[]): BaseSchema<A>;
export function oneOf<A extends number>(a: A, ...rest: A[]): BaseSchema<A>;
export function oneOf<A>(a: A, ...rest: A[]): BaseSchema<A>;

export function oneOf<A, B>(a: A, b: B): BaseSchema<A | B>;
export function oneOf<A, B, C>(a: A, b: B, c: C): BaseSchema<A | B | C>;
export function oneOf<A, B, C, D>(
  a: A,
  b: B,
  c: C,
  d: D
): BaseSchema<A | B | C | D>;
export function oneOf<A, B, C, D, E>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E
): BaseSchema<A | B | C | D | E>;
export function oneOf<A, B, C, D, E, F>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F
): BaseSchema<A | B | C | D | E | F>;
export function oneOf<A, B, C, D, E, F, G>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G
): BaseSchema<A | B | C | D | E | F | G>;
export function oneOf<A, B, C, D, E, F, G, H>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H
): BaseSchema<A | B | C | D | E | F | G | H>;
export function oneOf<A, B, C, D, E, F, G, H, I>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
  i: I
): BaseSchema<A | B | C | D | E | F | G | H | I>;

export function oneOf(a: any, ...rest: any[]): BaseSchema<any>;
export function oneOf(...values: any[]) {
  return new BaseSchema(
    test((obj) => [
      values.some((val) => equal(val, obj)),
      () => new ValueError(obj, values)
    ])
  );
}

export function is<A extends string>(a: A): BaseSchema<A>;
export function is<A extends number>(a: A): BaseSchema<A>;
export function is<A>(a: A): BaseSchema<A>;
export function is<A>(a: A): BaseSchema<A> {
  return new BaseSchema<A>(
    test((obj) => [equal(obj, a), () => new ValueError(obj, [a])])
  );
}

export const forbidden: Schema<undefined> = new Schema<undefined>(
  test((obj) => [obj === undefined, () => new ValueError(obj, [undefined])])
);

export function alternatives<A, B, C, D, E, F, G, H, I>(
  a: BaseSchema<A>,
  b: BaseSchema<B>,
  c: BaseSchema<C>,
  d: BaseSchema<D>,
  e: BaseSchema<E>,
  f: BaseSchema<F>,
  g: BaseSchema<G>,
  h: BaseSchema<H>,
  i: BaseSchema<I>
): BaseSchema<A | B | C | D | E | F | G | H | I>;
export function alternatives<A, B, C, D, E, F, G, H>(
  a: BaseSchema<A>,
  b: BaseSchema<B>,
  c: BaseSchema<C>,
  d: BaseSchema<D>,
  e: BaseSchema<E>,
  f: BaseSchema<F>,
  g: BaseSchema<G>,
  h: BaseSchema<H>
): BaseSchema<A | B | C | D | E | F | G | H>;
export function alternatives<A, B, C, D, E, F, G>(
  a: BaseSchema<A>,
  b: BaseSchema<B>,
  c: BaseSchema<C>,
  d: BaseSchema<D>,
  e: BaseSchema<E>,
  f: BaseSchema<F>,
  g: BaseSchema<G>
): BaseSchema<A | B | C | D | E | F | G>;
export function alternatives<A, B, C, D, E, F>(
  a: BaseSchema<A>,
  b: BaseSchema<B>,
  c: BaseSchema<C>,
  d: BaseSchema<D>,
  e: BaseSchema<E>,
  f: BaseSchema<F>
): BaseSchema<A | B | C | D | E | F>;
export function alternatives<A, B, C, D, E>(
  a: BaseSchema<A>,
  b: BaseSchema<B>,
  c: BaseSchema<C>,
  d: BaseSchema<D>,
  e: BaseSchema<E>
): BaseSchema<A | B | C | D | E>;
export function alternatives<A, B, C, D>(
  a: BaseSchema<A>,
  b: BaseSchema<B>,
  c: BaseSchema<C>,
  d: BaseSchema<D>
): BaseSchema<A | B | C | D>;
export function alternatives<A, B, C>(
  a: BaseSchema<A>,
  b: BaseSchema<B>,
  c: BaseSchema<C>
): BaseSchema<A | B | C>;
export function alternatives<A, B>(
  a: BaseSchema<A>,
  b: BaseSchema<B>
): BaseSchema<A | B>;
export function alternatives(a: any, b: any, ...rest: any[]): BaseSchema<any>;
export function alternatives(...schemas: any[]) {
  return new BaseSchema((obj) => {
    const errors: ValidationError[][] = [];
    for (const s of schemas) {
      const result = s.validate(obj);
      if (result.valid) {
        return result;
      } else {
        errors.push(result.errors);
      }
    }
    return invalid(new AlternativesError(obj, errors));
  });
}
