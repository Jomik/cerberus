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

  details(): string {
    return this.message;
  }
}

export class ValidationTypeError extends ValidationError {
  constructor(message: string) {
    super(message);
  }
}

export class ValidationObjectError extends ValidationError {
  constructor(public readonly descriptor: [string, ValidationError][]) {
    super("must satisfy schema");
  }

  details(): string {
    let messages = this.descriptor.map(([k, e]) => `${k}: ${e.details()}`);
    return `{ ${messages.join(", ")} }`;
  }
}

export class ValidationArrayError extends ValidationError {
  constructor(public readonly descriptor: [number, ValidationError][]) {
    super("must satisfy validator");
  }

  details(): string {
    let messages = this.descriptor.map(([i, e]) => `[${i}]: ${e.details()}`);
    return messages.join(", ");
  }
}

export class ValidationPropertyError extends ValidationError {
  constructor(public readonly property: string, err: ValidationError) {
    super(`property ${property} ${err.message}`);
  }
}

export function error(message: string) {
  return new ValidationError(message);
}

export function typeError(message: string) {
  return new ValidationTypeError(message);
}

export function objectError(descriptor: [string, ValidationError][]) {
  return new ValidationObjectError(descriptor);
}

export function arrayError(descriptor: [number, ValidationError][]) {
  return new ValidationArrayError(descriptor);
}

export function propertyError(property: string, err: ValidationError) {
  return new ValidationPropertyError(property, err);
}
