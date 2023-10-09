import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/otp/create')
  createOtp(@Body() createAuthDto: CreateOtpDto) {
    return this.authService.createOtp(createAuthDto);
  }

  @Post('/otp/validate')
  @HttpCode(200)
  validateOtp(@Body() validateOtpDto: ValidateOtpDto) {
    return this.authService.validateOtp(validateOtpDto);
  }
}
