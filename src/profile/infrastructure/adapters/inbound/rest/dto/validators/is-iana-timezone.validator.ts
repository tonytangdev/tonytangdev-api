import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsIANATimezone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isIANATimezone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Check if timezone is valid using Intl.supportedValuesOf (Node 16.9.0+)
          try {
            const timezones = Intl.supportedValuesOf('timeZone');
            return timezones.includes(value);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_error) {
            // Fallback: basic validation using DateTimeFormat
            try {
              Intl.DateTimeFormat(undefined, { timeZone: value });
              return true;
            } catch {
              return false;
            }
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid IANA timezone`;
        },
      },
    });
  };
}
