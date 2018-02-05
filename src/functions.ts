import * as equal from "fast-deep-equal";
import { BaseSchema } from "./schemas/base";
import { test } from "./utils";
import { ValueError, MissingError } from "./errors";

export function oneOf<A extends string>(a: A, ...rest: A[]): BaseSchema<A>;
export function oneOf<A extends number>(a: A, ...rest: A[]): BaseSchema<A>;
export function oneOf<A extends string, B extends number>(
  a: A | B,
  ...rest: (A | B)[]
): BaseSchema<A | B>;
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
  return new BaseSchema<any>(
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
