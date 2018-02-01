import * as equal from "fast-deep-equal";
import { Schema } from "./schemas/schema";
import { test, error } from "./utils";

export function oneOf<A extends string>(a: A, ...rest: A[]): Schema<A>;
export function oneOf<A extends number>(a: A, ...rest: A[]): Schema<A>;
export function oneOf<A extends string, B extends number>(
  a: A | B,
  ...rest: (A | B)[]
): Schema<A | B>;
export function oneOf<A>(a: A, ...rest: A[]): Schema<A>;

export function oneOf<A, B>(a: A, b: B): Schema<A | B>;
export function oneOf<A, B, C>(a: A, b: B, c: C): Schema<A | B | C>;
export function oneOf<A, B, C, D>(
  a: A,
  b: B,
  c: C,
  d: D
): Schema<A | B | C | D>;
export function oneOf<A, B, C, D, E>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E
): Schema<A | B | C | D | E>;
export function oneOf<A, B, C, D, E, F>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F
): Schema<A | B | C | D | E | F>;
export function oneOf<A, B, C, D, E, F, G>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G
): Schema<A | B | C | D | E | F | G>;
export function oneOf<A, B, C, D, E, F, G, H>(
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H
): Schema<A | B | C | D | E | F | G | H>;
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
): Schema<A | B | C | D | E | F | G | H | I>;

export function oneOf(a: any, ...rest: any[]): Schema<any>;
export function oneOf(...values) {
  return new Schema(
    test(
      (obj) => values.some((val) => equal(val, obj)),
      error`is not one of ${
        values.length > 1
          ? `${values.slice(0, -1).join(", ")} or ${values.slice(-1)}`
          : values[0]
      }`
    )
  );
}
