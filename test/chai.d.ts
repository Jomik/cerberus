declare namespace Chai {
  export interface Assertion {
    valid: Assertion;
    result: (expected: any) => Assertion;
  }
}
