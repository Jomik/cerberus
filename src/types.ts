export type Id<T> = T extends object ? { [K in keyof T]: T[K] } : T;
