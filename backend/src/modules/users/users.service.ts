import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { User } from '@modules/auth/user.entity';
import { PublicUserDto, UpdateProfileDto, UserProfileDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name) private readonly logger: PinoLogger,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    return this.toProfileDto(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileDto> {
    if (dto.username) {
      const existing = await this.usersRepo.findOne({ where: { username: dto.username } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    await this.usersRepo.update(userId, { ...dto });
    this.logger.info({ userId }, 'User profile updated');

    return this.getProfile(userId);
  }

  async getPublicProfile(userId: string): Promise<PublicUserDto> {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    return { id: user.id, username: user.username, createdAt: user.createdAt };
  }

  private toProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
