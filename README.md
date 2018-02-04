# Typescript object validator (Unnamed)

Experimental, work in progress.

[![Build Status](https://travis-ci.org/Jomik/object-validator.svg?branch=master)](https://travis-ci.org/Jomik/object-validator)
[![codecov](https://codecov.io/gh/jomik/object-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/jomik/object-validator)
[![Greenkeeper badge](https://badges.greenkeeper.io/Jomik/object-validator.svg)](https://greenkeeper.io/)

Here is a basic example.

```ts
// We can import the schema `types` to match the types of Typescript.
import { object, any, string, number } from "...";
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

```
npm install --save ...
```

## Contribute

Please submit an issue with outlining your idea. If small, a pull request can be submitted immediately.

* [Pull Requests](https://github.com/Jomik/object-validator/pulls)
* [Issues](https://github.com/Jomik/object-validator/issues)

## License

This project is licensed under the MIT license.
