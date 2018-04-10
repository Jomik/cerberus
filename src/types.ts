export type Id<T> = { [K in keyof T]: T[K] };

export type TypeClass<T> = T extends boolean
  ? Boolean
  : T extends number ? Number : T extends string ? String : T;

export type NonFunctionNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];
export type ZeroArgFunctionNames<T> = {
  [K in keyof T]: T[K] extends (...args: undefined[]) => any ? K : never
}[keyof T];
