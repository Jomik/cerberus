import * as equal from "fast-deep-equal";
import { BaseType, Type } from "./types/base";
import { test, valid, invalid } from "./utils";
import { string, number } from "./index";
import {
  ValueError,
  MissingError,
  ValidationError,
  AlternativesError
} from "./errors";

export function oneOf<A extends string>(a: A, ...rest: A[]): BaseType<A>;
export function oneOf<A extends number>(a: A, ...rest: A[]): BaseType<A>;
export function oneOf<A>(a: A, ...rest: A[]): BaseType<A>;

export function oneOf<A, B>(a: A, b: B): BaseType<A | B>;
export function oneOf<A, B, C>(a: A, b: B, c: C): BaseType<A | B | C>;
export function oneOf<A, B, C, D>(
  a: A,
  b: B,
  c: C,
  d: D
): BaseType<A | B | C | D>;
export function oneOf<A, B, C, D, E>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E
): BaseType<A | B | C | D | E>;
export function oneOf<A, B, C, D, E, F>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F
): BaseType<A | B | C | D | E | F>;
export function oneOf<A, B, C, D, E, F, G>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G
): BaseType<A | B | C | D | E | F | G>;
export function oneOf<A, B, C, D, E, F, G, H>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H
): BaseType<A | B | C | D | E | F | G | H>;
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
): BaseType<A | B | C | D | E | F | G | H | I>;

export function oneOf(a: any, ...rest: any[]): BaseType<any>;
export function oneOf(...values: any[]) {
  return new BaseType(
    test((obj) => [
      values.some((val) => equal(val, obj)),
      () => new ValueError(obj, values)
    ])
  );
}

export function is<A extends string>(a: A): BaseType<A>;
export function is<A extends number>(a: A): BaseType<A>;
export function is<A>(a: A): BaseType<A>;
export function is<A>(a: A): BaseType<A> {
  return new BaseType<A>(
    test((obj) => [equal(obj, a), () => new ValueError(obj, [a])])
  );
}

export const forbidden: Type<undefined> = new Type<undefined>(
  test((obj) => [obj === undefined, () => new ValueError(obj, [undefined])])
);

export function alternatives<A, B, C, D, E, F, G, H, I>(
  a: BaseType<A>,
  b: BaseType<B>,
  c: BaseType<C>,
  d: BaseType<D>,
  e: BaseType<E>,
  f: BaseType<F>,
  g: BaseType<G>,
  h: BaseType<H>,
  i: BaseType<I>
): BaseType<A | B | C | D | E | F | G | H | I>;
export function alternatives<A, B, C, D, E, F, G, H>(
  a: BaseType<A>,
  b: BaseType<B>,
  c: BaseType<C>,
  d: BaseType<D>,
  e: BaseType<E>,
  f: BaseType<F>,
  g: BaseType<G>,
  h: BaseType<H>
): BaseType<A | B | C | D | E | F | G | H>;
export function alternatives<A, B, C, D, E, F, G>(
  a: BaseType<A>,
  b: BaseType<B>,
  c: BaseType<C>,
  d: BaseType<D>,
  e: BaseType<E>,
  f: BaseType<F>,
  g: BaseType<G>
): BaseType<A | B | C | D | E | F | G>;
export function alternatives<A, B, C, D, E, F>(
  a: BaseType<A>,
  b: BaseType<B>,
  c: BaseType<C>,
  d: BaseType<D>,
  e: BaseType<E>,
  f: BaseType<F>
): BaseType<A | B | C | D | E | F>;
export function alternatives<A, B, C, D, E>(
  a: BaseType<A>,
  b: BaseType<B>,
  c: BaseType<C>,
  d: BaseType<D>,
  e: BaseType<E>
): BaseType<A | B | C | D | E>;
export function alternatives<A, B, C, D>(
  a: BaseType<A>,
  b: BaseType<B>,
  c: BaseType<C>,
  d: BaseType<D>
): BaseType<A | B | C | D>;
export function alternatives<A, B, C>(
  a: BaseType<A>,
  b: BaseType<B>,
  c: BaseType<C>
): BaseType<A | B | C>;
export function alternatives<A, B>(
  a: BaseType<A>,
  b: BaseType<B>
): BaseType<A | B>;
export function alternatives(a: any, b: any, ...rest: any[]): BaseType<any>;
export function alternatives(...schemas: any[]) {
  return new BaseType((obj) => {
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
