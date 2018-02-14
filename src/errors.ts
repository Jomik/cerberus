import { stringify } from "./utils";

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

  pathToString(source?: string): string {
    return this.path.reduce<string>(
      (acc, cur) => acc + (typeof cur === "number" ? `[${cur}]` : `.${cur}`),
      source || ""
    );
  }

  toString(source?: string): string {
    const what =
      stringify(this.obj) + (this.suffix !== undefined ? this.suffix : "");
    const prefix =
      this.path.length > 0
        ? `${this.pathToString(source)} is ${what} but`
        : source || what;
    return `${prefix} must ${this.message}`;
  }
}

export class MissingError extends ValidationError {
  constructor(obj: any) {
    super(obj, "be defined");
    this.fatal = true;
  }

  toString(source?: string): string {
    const prefix =
      this.path.length > 0
        ? `${this.pathToString(source)}`
        : source || stringify(this.obj);
    return `${prefix} must be defined`;
  }
}

export class TypeError extends ValidationError {
  constructor(obj: any, public type: string) {
    super(obj, `be of type ${type}`);
    this.fatal = true;
  }
}

export class ConstraintError extends ValidationError {
  constructor(
    obj: any,
    message: string,
    public type: string,
    public constraint: any,
    public prop?: string
  ) {
    super(obj, message, prop !== undefined ? `.${prop}` : undefined);
  }
}

export class ValueError extends ValidationError {
  values: any[];
  constructor(obj: any, values: any[]) {
    const strings = values.map(stringify);
    super(
      obj,
      `be ${
        strings.length > 1
          ? `${strings.slice(0, -1).join(", ")} or ${strings.slice(-1)}`
          : strings[0]
      }`
    );
    this.values = values;
  }
}

export class AlternativesError extends ValidationError {
  constructor(obj: any, public errors: ValidationError[][]) {
    super(obj, "match a schema");
  }

  toString(source?: string): string {
    const prefix =
      this.path.length > 0
        ? `${this.pathToString(source)}`
        : source || stringify(this.obj);
    return `${prefix} must fix any set of the following errors:\n(${this.errors
      .map((earr) => earr.map((e) => e.toString(source)).join(", "))
      .join("),\n(")})`;
  }
}
