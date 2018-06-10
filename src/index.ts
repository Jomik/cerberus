import { Validator } from "./validator";

export * from "./result";
export * from "./errors";
export * from "./validator";
export * from "./initializers";

export function validate<A>(validator: Validator<false, A>, value: any) {
  return validator.validate(value);
}

export async function validateAsync<A>(
  validator: Validator<boolean, A>,
  value: any
) {
  return validator.validateAsync(value);
}

export function assert<A>(validator: Validator<false, A>, value: any) {
  return validator.assert(value);
}

export async function assertAsync<A>(
  validator: Validator<boolean, A>,
  value: any
) {
  return validator.assertAsync(value);
}

export function and<PA extends boolean, A, PB extends boolean, B>(
  left: Validator<PA, A>,
  right: Validator<PB, B>
): Validator<PA | PB, A & B> {
  return left.and(right);
}

export function or<PA extends boolean, A, PB extends boolean, B>(
  left: Validator<PA, A>,
  right: Validator<PB, B>
): Validator<PA | PB, A | B> {
  return left.or(right);
}

export function xor<PA extends boolean, A, PB extends boolean, B>(
  left: Validator<PA, A>,
  right: Validator<PB, B>
): Validator<PA | PB, A | B> {
  return left.xor(right);
}

export function map<PA extends boolean, A, B>(
  validator: Validator<PA, A>,
  f: (value: A) => B
): Validator<PA, B> {
  return validator.map(f);
}

export function mapAsync<A, B>(
  validator: Validator<boolean, A>,
  f: (value: A) => Promise<B>
): Validator<true, B> {
  return validator.mapAsync(f);
}
