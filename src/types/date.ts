import { BaseType } from "./base";
import { TypeTest } from "../types";
import { test, valid, invalid } from "../utils";
import { MissingError, TypeError } from "../errors";
import { NumericProperty } from "../constraints/property";

export class DateType extends BaseType<Date> {
  satisfies: (
    predicate: (obj: Date) => boolean,
    message: string,
    type: string
  ) => DateType;

  get year(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getUTCFullYear(),
      "year",
      this.chain.bind(this),
      DateType
    );
  }
  get month(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getUTCMonth(),
      "month",
      this.chain.bind(this),
      DateType
    );
  }
  get date(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getUTCDate(),
      "date",
      this.chain.bind(this),
      DateType
    );
  }
  get day(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getUTCDay(),
      "day",
      this.chain.bind(this),
      DateType
    );
  }

  get hours(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getUTCHours(),
      "hours",
      this.chain.bind(this),
      DateType
    );
  }
  get minutes(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getUTCMinutes(),
      "minutes",
      this.chain.bind(this),
      DateType
    );
  }
  get seconds(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getUTCSeconds(),
      "seconds",
      this.chain.bind(this),
      DateType
    );
  }
  get milliseconds(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getUTCMilliseconds(),
      "milliseconds",
      this.chain.bind(this),
      DateType
    );
  }

  get time(): NumericProperty<Date, DateType> {
    return new NumericProperty<Date, DateType>(
      (obj) => obj.getTime(),
      "time",
      this.chain.bind(this),
      DateType
    );
  }

  constructor(
    validate: TypeTest<Date> = (obj: any) => {
      if (obj instanceof Date) {
        return valid(obj);
      } else if (typeof obj === "string") {
        const date = new Date(obj);
        if (!Number.isNaN(date.valueOf())) {
          return valid(date);
        }
      }
      return invalid(
        obj === undefined ? new MissingError(obj) : new TypeError(obj, "date")
      );
    }
  ) {
    super(validate);
  }
}
