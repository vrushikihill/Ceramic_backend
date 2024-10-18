import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from './decorator/get-user.decorator';
import { ForgotDto, LoginDto, ResetDto, SignupDto } from './dto/auth.dto';
import { JwtGuard } from './guard/jwt.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signup({ data: body });
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login({ data: body });
  }

  @Post('super-admin/login')
  superAdminLogin(@Body() data: LoginDto) {
    return this.authService.superAdminLogin({ data: data });
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  profile(@GetUser('id') userId: string) {
    return this.authService.profile({
      userId: userId,
    });
  }

  @Get('/verify/:token')
  async verify(@Param('token') token: string) {
    try {
      await this.authService.verifyEmailToken(token);

      return `<div style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="text-align: center; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #6b49b3;">Email Verified Successfully</h1>
        <p style="color: #555; margin-bottom: 50px;">Thank you for verifying your email address. You can now access all features.</p>
        <a style="margin-top: 20px; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #6b49b3; border: none; border-radius: 5px; cursor: pointer; text-decoration : none" href=${process.env.APP_URL}>Go back to Log in</a>
    </div>
</div>`;
    } catch (error) {
      return error.message;
    }
  }

  @Post('/forgot')
  async forgot(@Body() body: ForgotDto) {
    // await
    this.authService.sendResetEmail(body.email);

    return {
      message: 'Reset link sent to your email',
    };
  }

  @Get('/set-password/:token')
  async validateSetPasswordToken(@Param('token') token: string) {
    await this.authService.validateResetPasswordToken(token);

    return {
      isValid: true,
    };
  }

  @Post('/set-password')
  async setPassword(@Body() body: ResetDto) {
    const tokenDetails = await this.authService.validateResetPasswordToken(
      body.token,
    );

    await this.authService.setPassword(
      body.token,
      body.password,
      tokenDetails.email,
    );

    return {
      message: 'Password updated successfully',
    };
  }
}
