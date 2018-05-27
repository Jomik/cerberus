import { ValidationError } from "./errors";

export type ResultMatch<A, K> = {
  valid: (value: A) => K;
  invalid: (error: ValidationError) => K;
};

export abstract class Result<A> {
  abstract readonly result:
    | { valid: true; object: A }
    | { valid: false; error: ValidationError };

  abstract match<K>(m: ResultMatch<A, K>): K;
  abstract chain<B>(f: (object: A) => Promise<Result<B>>): Promise<Result<B>>;
  abstract chain<B>(f: (object: A) => Result<B>): Result<B>;
}

class ValidResult<A> extends Result<A> {
  readonly result: { valid: true; object: A };
  constructor(object: A) {
    super();
    this.result = { valid: true, object };
  }

  match<K>(m: ResultMatch<A, K>) {
    return m.valid(this.result.object);
  }

  chain<B>(f: Function) {
    return f(this.result.object);
  }
}

class InvalidResult extends Result<any> {
  readonly result: { valid: false; error: ValidationError };
  constructor(error: ValidationError) {
    super();
    this.result = { valid: false, error };
  }

  match<K>(m: ResultMatch<any, K>) {
    return m.invalid(this.result.error);
  }

  chain(f: Function) {
    return <any>this;
  }
}

export function valid<A>(object: A): Result<A> {
  return new ValidResult(object);
}

export function invalid<A = any>(error: ValidationError): Result<A> {
  return new InvalidResult(error);
}
