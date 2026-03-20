import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@common/decorators/public.decorator';
import { AuthService } from './auth.service';
import {
  SignUpDto,
  ConfirmSignUpDto,
  SignInDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  CognitoTokenResponseDto,
} from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new player account' })
  @ApiResponse({ status: 201, description: 'Account created — confirmation email sent' })
  @ApiResponse({ status: 409, description: 'Username or email already taken' })
  signUp(@Body() dto: SignUpDto): Promise<{ userSub: string }> {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Confirm account with emailed verification code' })
  @ApiResponse({ status: 204, description: 'Account confirmed' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  confirmSignUp(@Body() dto: ConfirmSignUpDto): Promise<void> {
    return this.authService.confirmSignUp(dto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'Authenticated', type: CognitoTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials or unconfirmed account' })
  signIn(@Body() dto: SignInDto): Promise<CognitoTokenResponseDto> {
    return this.authService.signIn(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using a Cognito refresh token' })
  @ApiResponse({ status: 200, description: 'New access token issued', type: CognitoTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() dto: RefreshDto): Promise<CognitoTokenResponseDto> {
    return this.authService.refresh(dto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate all tokens for the current user' })
  @ApiResponse({ status: 204, description: 'Signed out' })
  signOut(@Req() req: Request): Promise<void> {
    const [, token] = (req.headers.authorization ?? '').split(' ');
    return this.authService.signOut(token);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Send password reset code to email' })
  @ApiResponse({ status: 204, description: 'Reset code sent' })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set new password with reset code' })
  @ApiResponse({ status: 204, description: 'Password reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset code' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(dto);
  }
}
