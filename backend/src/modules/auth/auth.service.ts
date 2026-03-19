import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@config/config.service';
import { JwtPayload, TokenPair } from '@common/types';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';
import { RegisterDto, LoginDto } from './auth.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(RefreshToken) private readonly tokensRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.usersRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (existing) {
      throw new ConflictException('Username or email already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.usersRepo.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });

    await this.usersRepo.save(user);
    this.logger.info({ userId: user.id }, 'New user registered');

    return this.issueTokenPair(user);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'username', 'email', 'role', 'passwordHash'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.info({ userId: user.id }, 'User logged in');
    return this.issueTokenPair(user);
  }

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
        secret: this.configService.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = await bcrypt.hash(rawRefreshToken, BCRYPT_ROUNDS);
    const stored = await this.tokensRepo.findOne({ where: { userId: payload.sub } });

    if (!stored || !(await bcrypt.compare(rawRefreshToken, stored.tokenHash))) {
      throw new UnauthorizedException('Refresh token not recognized');
    }

    if (stored.expiresAt < new Date()) {
      await this.tokensRepo.delete({ id: stored.id });
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.usersRepo.findOneOrFail({ where: { id: payload.sub } });
    await this.tokensRepo.delete({ userId: user.id });

    void tokenHash;
    return this.issueTokenPair(user);
  }

  async logout(userId: string): Promise<void> {
    await this.tokensRepo.delete({ userId });
    this.logger.info({ userId }, 'User logged out');
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const jwtPayload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.jwtAccessSecret,
      expiresIn: this.configService.jwtAccessExpiry,
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshExpiry,
    });

    const tokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.tokensRepo.delete({ userId: user.id });
    await this.tokensRepo.save(
      this.tokensRepo.create({ userId: user.id, tokenHash, expiresAt }),
    );

    return { accessToken, refreshToken };
  }
}
