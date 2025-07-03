import { Transform, TransformFnParams } from "class-transformer";
import { 
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint()
export class AllOrArrayOfNumbersConstraint implements ValidatorConstraintInterface {
    validate(date: Date, args: ValidationArguments) {
        const value = args.value;
        if (value == '*') {
          return true;
        }
        if (typeof(value) == 'object' && value?.length != undefined) {
          if ((value as any[]).filter((v) => typeof v != 'number').length === 0) {
            return true;
          }
        }
        return false;
    }

    defaultMessage(args: ValidationArguments) {
        return `Must be '*' of an array of numbers`;
    }
}

export function AllOrArrayOfNumbers( validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: AllOrArrayOfNumbersConstraint,
        });
    };
}

export class SendMessageDto {
  @AllOrArrayOfNumbers()
  public to: '*' | number[];

  @IsNotEmpty()
  @IsString()
  public subject: string;

  @IsNotEmpty()
  @IsObject()
  public message: {[key: string]: string | number};
}