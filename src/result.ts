import { ValidationError } from "./errors";

export type ResultMatch<A, K> = {
  valid: (value: A) => K;
  invalid: (error: ValidationError) => K;
};

export abstract class Result<A> {
  abstract readonly info:
    | { valid: true; value: A }
    | { valid: false; error: ValidationError };

  abstract match<K>(m: ResultMatch<A, K>): K;
  abstract chain<B>(f: (value: A) => Promise<Result<B>>): Promise<Result<B>>;
  abstract chain<B>(f: (value: A) => Result<B>): Result<B>;
}

class ValidResult<A> extends Result<A> {
  readonly info: { valid: true; value: A };
  constructor(value: A) {
    super();
    this.info = { valid: true, value };
  }

  match<K>(m: ResultMatch<A, K>) {
    return m.valid(this.info.value);
  }

  chain<B>(f: Function) {
    return f(this.info.value);
  }
}

class InvalidResult extends Result<any> {
  readonly info: { valid: false; error: ValidationError };
  constructor(error: ValidationError) {
    super();
    this.info = { valid: false, error };
  }

  match<K>(m: ResultMatch<any, K>) {
    return m.invalid(this.info.error);
  }

  chain(f: Function) {
    return <any>this;
  }
}

export function valid<A>(value: A): Result<A> {
  return new ValidResult(value);
}

export function invalid<A = any>(error: ValidationError): Result<A> {
  return new InvalidResult(error);
}
