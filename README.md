# Cerberus

_Thé typescript object validator_ \
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

* Validation against types and exact values
* Correctly typed result object
* Relevant constraints for each type, e.g. string.length
* Optional and default values
* Referencing values within objects

## Installation

_Currently waiting to publish on npm_

```
npm install --save github:jomik/cerberus
```

## Examples

```ts
import { object, array, string, number } from "cerberus";

const person = object({ name: string, id: number });
const schema = person.extend({
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

## API Reference

_Temporary_

#### `BaseType<A>`

Returns type `A` when validated

`Type#validate(obj: any)` Validates object against schema \
`Type#optional()` Allows the value to be undefined \
`Type#default(value: A)` Sets a default `value` if object is undefined

#### `AnyType`

Returns type `any` when validated

### `BooleanType`

Returns type `boolean` when validated \
 `#truthy(...values: any[])` Perceives values as true \
 `#falsy(...values: any[])` Perceives values as false

#### `NumberType`

Returns type `number` when validated \
 `#gt/ge/eq/le/lt(n: number)` Requires number to satisfy the equality \
 `#between(low: number, high: number)` Requires the number to be between `low` and `high`, inclusive \
 `#negative()` Requires the number to be negative \
 `#positive()` Requires the number to be positive \
 `#multiple(n: number)` Requires the number to be a multiple of `n`

#### `StringType`

Returns type `string` when validated \
 `#includes(str: string)` Requires the string to include `str` \
 `#matches(exp: RegExp)` Requires the string to match `exp` \
 `#alphanum()` Requires the string to be alphanumeric \
 `#email()` Requires the string to be an email \
 `.length#gt/ge/eq/le/lt(n: number)` Requires the length of the string to satisfy the equality

#### `ArrayType<A>`

Returns type `Array<A>` when validated \
 _Constructed with a Type_ \
`#includes(value: A)` Requires that the array includes `value`, checked with deep equality \
 `#some(predicate: (obj: A) => boolean, description: string)` Requires some element to satisfy the predicate \
 `.length#gt/ge/eq/le/lt(n: number)` Requires the length of the array to satisfy the equality \
 `.length#between(low: number, high: number)` Requires length of array to be between `low` and `high`, inclusive

#### `ObjectType<A>`

Returns type `object` with keys from `A` when validated \
 _Constructed with an ObjectSchema_ \
 `#merge(spec: ObjectSchema<B>` Merges `spec` into the schema's specification, overriding clashes \
 `#strict()` Requires the object to have exactly the keys specified

```ts
type ObjectSchema<A extends object> = {
  [k in keyof A]: Type<A[k]> | ((obj: A) => Type<A[k]>)
};
```

#### Functions

`validate(schema: Type, obj: any)` Validates object against schema \
`is(a: any)` Requires the value to be exactly `a` \
`oneOf(...values: any[])` Requires the value to be one of the arguments \
`alternatives(...schemas: BaseType)` Requires the value to satisfy one of the arguments \
`forbidden` Requires the object to be undefined, useful for object keys

## Contribute

Please submit an issue with outlining your idea. If small, a pull request can be submitted immediately.

* [Pull Requests](https://github.com/Jomik/cerberus/pulls)
* [Issues](https://github.com/Jomik/cerberus/issues)

## License

This project is licensed under the MIT license.
