import {
  IsEnum,
  IsNotEmpty,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isEmail,
  isPhoneNumber,
} from 'class-validator';
import { OtpTarget } from './common-otp.dto';

@ValidatorConstraint({ async: false })
export class IsPhoneOrEmailBasedOnTargetValidator
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments): boolean {
    const obj = args.object as any;

    if (obj.target === OtpTarget.SMS || obj.target === OtpTarget.WHATSAPP) {
      return isPhoneNumber(value);
    }
    if (obj.target === OtpTarget.EMAIL) {
      return isEmail(value);
    }
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const obj = args.object as any;
    if (obj.target === OtpTarget.SMS || obj.target === OtpTarget.WHATSAPP) {
      return `${args.property} must be a phone number`;
    }
    if (obj.target === OtpTarget.EMAIL) {
      return `${args.property} must be an email`;
    }
  }
}

export class CreateOtpDto {
  @IsNotEmpty()
  @IsEnum(OtpTarget)
  target: OtpTarget;

  @IsNotEmpty()
  @Validate(IsPhoneOrEmailBasedOnTargetValidator)
  to: string;
}
