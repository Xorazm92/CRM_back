import { BadRequestException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  try {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isPhoneNumber',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            if (!Number(value)) {
              return false;
            }
            if (value.length !== 13) {
              return false;
            }
            if (value.slice(0, 4) !== '+998') {
              return false;
            }
            if (!Number(value.slice(4, value.length))) {
              return false;
            }
            return true;
          },
          defaultMessage(args: ValidationArguments) {
            return `invalid ${args.property}, ${args.property} must like this format: +998XXXXXXXXX `;
          },
        },
      });
    };
  } catch (error) {
    throw new BadRequestException(`Error on validate phone number: ${error}`);
  }
}
