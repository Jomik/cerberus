export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (<any>this).__proto__ = new.target.prototype;
    }
  }
}

export class ValidationTypeError extends ValidationError {
  constructor(message: string) {
    super(message);
  }
}

export class ValidationObjectError extends ValidationError {
  constructor(public readonly object: { [index: string]: ValidationError }) {
    super("must satisfy schema");
  }

  details(): string {
    let messages = Object.entries(this.object).map(
      ([k, e]) =>
        `${k}: ${e instanceof ValidationObjectError ? e.details() : e.message}`
    );
    return `{ ${messages.join(", ")} }`;
  }
}

export function error(message: string) {
  return new ValidationError(message);
}

export function typeError(message: string) {
  return new ValidationTypeError(message);
}

export function objectError(object: { [index: string]: ValidationError }) {
  return new ValidationObjectError(object);
}
