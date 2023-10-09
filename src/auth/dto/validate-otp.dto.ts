import { IsNotEmpty, IsNumberString } from 'class-validator';
import { CreateOtpDto } from './create-otp.dto';

export class ValidateOtpDto extends CreateOtpDto {
  @IsNotEmpty()
  @IsNumberString()
  otp: string;
}
