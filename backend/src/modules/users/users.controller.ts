import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@common/decorators/auth-user.decorator';
import { AuthenticatedUser } from '@common/types';
import { WithIdParamDto } from '@common/dto';
import { UsersService } from './users.service';
import { PublicUserDto, UpdateProfileDto, UserProfileDto } from './users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  getMe(@AuthUser() user: AuthenticatedUser): Promise<UserProfileDto> {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  @ApiResponse({ status: 409, description: 'Username already taken' })
  updateMe(
    @AuthUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile of any user' })
  @ApiResponse({ status: 200, type: PublicUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param() { id }: WithIdParamDto): Promise<PublicUserDto> {
    return this.usersService.getPublicProfile(id);
  }
}
