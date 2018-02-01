import { expect } from "chai";
import { validate } from "../src";
import { Schema } from "../src/schemas/schema";
// tslint:disable:no-unused-expression

export function test<A>(spec: Schema<A>, validObjs: A[], invalidObjs?: any[]) {
  for (const obj of validObjs) {
    const { valid } = validate(spec, obj);
    expect(valid).to.be.true;
  }
  if (invalidObjs !== undefined) {
    for (const obj of invalidObjs) {
      const { valid } = validate(spec, obj);
      expect(valid).to.be.false;
    }
  }
}
