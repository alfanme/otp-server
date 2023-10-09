import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Resend } from 'resend';
import { Redis } from '@upstash/redis';
import { Twilio } from 'twilio';

import { CreateOtpDto } from './dto/create-otp.dto';
import { ValidateOtpDto } from './dto/validate-otp.dto';
import { OtpTarget } from './dto/common-otp.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private resend: Resend;
  private redis: Redis;
  private twilio: Twilio;

  onModuleInit() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    });
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOtp(createOtpDto: CreateOtpDto) {
    const { target, to } = createOtpDto;

    const otp = this.generateOtp();
    const text = `Your OTP is ${otp}`;

    if (target === OtpTarget.EMAIL) {
      await this.resend.emails.send({
        from: 'OTP Service <otp-service@resend.dev>',
        to: [to],
        subject: 'OTP',
        text,
      });
    }

    if (target === OtpTarget.SMS) {
      await this.twilio.messages.create({
        from: process.env.TWILIO_SMS_NUMBER,
        to,
        body: text,
      });
    }

    if (target === OtpTarget.WHATSAPP) {
      await this.twilio.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`,
        body: text,
      });
    }

    const key = `${target}:${to}`;
    const ex = 10 * 60; // in seconds
    await this.redis.set<{ otp: string }>(key, { otp }, { ex });

    return {
      message: `OTP was sent to ${target}: ${to}!`,
    };
  }

  async validateOtp(validateOtpDto: ValidateOtpDto) {
    const { target, to, otp: otpInput } = validateOtpDto;

    const key = `${target}:${to}`;
    const value = await this.redis.get<{ otp: string }>(key);

    if (value === null || value?.otp !== otpInput) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'OTP input is wrong or expired!',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.redis.del(key);

    return {
      message: 'OTP was validated!',
    };
  }
}
