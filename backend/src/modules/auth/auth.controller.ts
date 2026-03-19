import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { AuthUser } from '@common/decorators/auth-user.decorator';
import { AuthenticatedUser } from '@common/types';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto, TokenResponseDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new player account' })
  @ApiResponse({ status: 201, description: 'Account created', type: TokenResponseDto })
  @ApiResponse({ status: 409, description: 'Username or email already taken' })
  register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Authenticated', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access/refresh token pair' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed', type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate current refresh token' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  logout(@AuthUser() user: AuthenticatedUser): Promise<void> {
    return this.authService.logout(user.id);
  }
}
