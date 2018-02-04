import { stringify } from "./utils";

export type ValidationErrorConstructor = (obj) => ValidationError;

export class ValidationError {
  get name(): string {
    return this.constructor.name;
  }
  path: (string | number)[] = [];
  fatal: boolean = false;

  constructor(
    public obj: any,
    public message: string,
    private suffix?: string
  ) {}

  toString(): string {
    const what =
      stringify(this.obj) + (this.suffix !== undefined ? this.suffix : "");
    const prefix =
      this.path.length > 0
        ? `${this.path.reduce(
            (acc, cur) =>
              `${acc}${typeof cur === "number" ? `[${cur}]` : `.${cur}`}`,
            ""
          )} is ${what} but`
        : what;
    return `${prefix} must ${this.message}`;
  }
}

export class MissingError extends ValidationError {
  constructor(obj: any) {
    super(obj, "be defined");
    this.fatal = true;
  }
}

export class TypeError extends ValidationError {
  constructor(obj: any, public type: string) {
    super(obj, `be of type ${type}`);
    this.fatal = true;
  }
}

export class ConstraintError extends ValidationError {
  constructor(obj: any, public constraint: string, prop?: string) {
    super(obj, `${constraint}`, prop !== undefined ? `.${prop}` : undefined);
  }
}

export class ValueError extends ValidationError {
  values: any[];
  constructor(obj: any, values: any[]) {
    super(obj, "");
    this.values = values;
    const strings = values.map(stringify);
    this.message = `be ${
      strings.length > 1
        ? `${strings.slice(0, -1).join(", ")} or ${strings.slice(-1)}`
        : strings[0]
    }`;
  }
}
