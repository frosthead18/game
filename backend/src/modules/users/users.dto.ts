import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@common/enums';

export class UserProfileDto {
  @ApiProperty({ description: 'User UUID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Username', example: 'hero123' })
  username!: string;

  @ApiProperty({ description: 'Email address' })
  email!: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role!: UserRole;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt!: Date;
}

export class PublicUserDto {
  @ApiProperty({ description: 'User UUID', format: 'uuid' })
  id!: string;

  @ApiProperty({ description: 'Username', example: 'hero123' })
  username!: string;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt!: Date;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'New username', minLength: 3, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;
}
