export type Id<T> = T extends object ? { [K in keyof T]: T[K] } : T;
export type IsAsync<T> = (T extends false ? false : true) extends false
  ? false
  : true;
