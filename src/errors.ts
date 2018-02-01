export class ValidationError {
  name: string = this.constructor.name;
  path: string[] = [];

  constructor(
    public obj: any,
    public message: string,
    private suffix?: string
  ) {}

  toString(): string {
    const prefix = this.path.length > 0 ? `${this.path.join(".")} = ` : "";
    return `${prefix}${
      this.obj !== null &&
      typeof this.obj === "object" &&
      !Array.isArray(this.obj)
        ? "<object>"
        : JSON.stringify(this.obj)
    }${this.suffix !== undefined ? this.suffix : ""} ${this.message}`;
  }
}

export class MissingError extends ValidationError {
  constructor(obj: any) {
    super(obj, "must be defined");
  }
}

export class TypeError extends ValidationError {
  constructor(obj: any, public type: string) {
    super(obj, `is not of type ${type}`);
  }
}

export class ConstraintError extends ValidationError {
  constructor(obj: any, public constraint: string, prop?: string) {
    super(
      obj,
      `must satisfy constraint ${constraint}`,
      `${prop !== undefined ? `.${prop}` : undefined}`
    );
  }
}

export class ValueError extends ValidationError {
  values: any[];
  constructor(obj: any, ...values: any[]) {
    super(obj, "");
    this.values = values;
    const strings = values.map(
      (v) =>
        v !== null && typeof v === "object" && !Array.isArray(v)
          ? "<object>"
          : JSON.stringify(v)
    );
    this.message = `must be ${
      strings.length > 1
        ? `${strings.slice(0, -1).join(", ")} or ${strings.slice(-1)}`
        : strings[0]
    }`;
  }
}
