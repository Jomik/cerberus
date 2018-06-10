# Cerberus

_The typescript object validator_ \
Experimental, work in progress.

[![Build Status](https://travis-ci.org/Jomik/cerberus.svg?branch=master)](https://travis-ci.org/Jomik/cerberus)
[![codecov](https://codecov.io/gh/jomik/cerberus/branch/master/graph/badge.svg)](https://codecov.io/gh/jomik/cerberus)
[![dependencies Status](https://david-dm.org/jomik/cerberus/status.svg)](https://david-dm.org/jomik/cerberus)
[![devDependencies Status](https://david-dm.org/jomik/cerberus/dev-status.svg)](https://david-dm.org/jomik/cerberus?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/Jomik/cerberus.svg)](https://greenkeeper.io/)

Here is a basic example.

```ts
// We can import the schema `types` to match the types of Typescript.
import { object, any, string, number } from "cerberus";
// Create our schema
const schema = object({
  a: string,
  b: number,
  c: any
});
// Get an object to test
const obj: any = { a: "foo", b: 42, c: "bar" };
// Validate the object against the schema
const result = schema.validate(obj);
if (result.valid) {
  // A valid result gives us
  // result.obj: { a: string, b: number, c: any }
}
```

## Features

- Validation against types and exact values
- Correctly typed result object
- Relevant constraints for each type, e.g. string.length
- Optional and default values
- Referencing values within objects
- Asynchronously validate values with mapAsync

## Installation

```
npm install cerberus
```

## Examples

```ts
import { object, array, string, integer } from "cerberus";

const person = object({ name: string, id: integer.positive() });
const schema = object({
  ...person.schema,
  mother: person,
  father: person,
  children: array(person)
});
const result = schema.validate({
  name: "foo jr bar",
  id: 3,
  mother: { name: "baz buz bar", id: 1 },
  father: { name: "foo bar", id: 2 },
  children: [{ name: "bum bar", id: 4 }, { name: "baz bar", id: 5 }]
});
```

## API Documentation

_Temporary_

### Types

The below functions are exposed to create a validator.

- `boolean: Validator<boolean>`
- `number: Validator<number>`
- `string: Validator<string>`
- `any: Validator<any>`
- `integer: Validator<number>` - not a decimal
- `nil: Validator<null>`
- `required: Validator<any>` - not undefined and not null
- `forbidden: Validator<undefined>`
- `array(Validator<A>): Validator<A[]>`
- `object(Schema<A>): Validator<A>`

A schema is an object where each property is a validator or a function from `A` to a validator.

### Runners

Below are the two methods of running a validator. Both of these also have an async version, called by appending `Async`.

#### `validate(Validator<A>, value): Result<A>`, `validateAsync(Validator<A>, value): Result<A>`

Result contains an `info` property, which is an object containing whether the result is valid or not, and if it is valid, it holds the validated value, else it holds an error.

`info: { valid: true; object: A } | { valid: false; error: ValidationError }`

#### `assert(Validator<A>, value): A`, `assertAsync(Validator<A>, value): A`

Returns the validated value, or throws an error if invalid.

### Logical operators

The below functions are exposed for logical operations on validators.
They are also methods on the class, if you prefer chaining.

#### `and(Validator<A>, Validator<B>): Validator<A & B>`

Short circuits if the first is invalid.

#### `or(Validator<A>, Validator<B>): Validator<A | B>`

Short circuits if the first is valid.

#### `xor(Validator<A>, Validator<B>): Validator<A | B>`

Is valid if only one is valid, invalid in all other cases.

### Methods

#### `#default(a: A): Validator<A>`

Allows the value to be undefined, and returns `a` in that case.

#### `#optional<A>(): Validator<A | undefined>`

Allows the value to be undefined.

#### `#not(a: A): Validator<A>`

Ensures that the value is not strictly equal to `a`.

#### `#map(A -> B): Validator<B>`, `mapAsync(A -> Promise<B>): Validator<B>`

Maps the result through the function if the validator returns valid.

## Contribute

Please submit an issue with outlining your idea. If small, a pull request can be submitted immediately.

- [Pull Requests](https://github.com/Jomik/cerberus/pulls)
- [Issues](https://github.com/Jomik/cerberus/issues)

## License

This project is licensed under the MIT license.
