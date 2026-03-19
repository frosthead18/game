import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from '@infrastructure/database/snake-naming.strategy';
import { Params as PinoParams } from 'nestjs-pino';

@Injectable()
export class ConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: NestConfigService) {}

  get nodeEnv(): string {
    return this.config.getOrThrow<string>('NODE_ENV');
  }

  get port(): number {
    return this.config.getOrThrow<number>('PORT');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get dbHost(): string {
    return this.config.getOrThrow<string>('DB_HOST');
  }

  get dbPort(): number {
    return this.config.getOrThrow<number>('DB_PORT');
  }

  get dbUser(): string {
    return this.config.getOrThrow<string>('DB_USER');
  }

  get dbPassword(): string {
    return this.config.getOrThrow<string>('DB_PASSWORD');
  }

  get dbName(): string {
    return this.config.getOrThrow<string>('DB_NAME');
  }

  get jwtAccessSecret(): string {
    return this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  get jwtAccessExpiry(): string {
    return this.config.getOrThrow<string>('JWT_ACCESS_EXPIRY');
  }

  get jwtRefreshSecret(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiry(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_EXPIRY');
  }

  get sentryDsn(): string | undefined {
    return this.config.get<string>('SENTRY_DSN');
  }

  get corsOrigin(): string {
    return this.config.getOrThrow<string>('CORS_ORIGIN');
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.dbPassword,
      database: this.dbName,
      synchronize: false,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
      logging: this.isDevelopment ? ['query', 'error'] : ['error'],
    };
  }

  get loggerOptions(): PinoParams {
    return {
      pinoHttp: {
        base: null,
        autoLogging: false,
        redact: ['password', 'headers.authorization', 'req.headers.authorization'],
        transport: this.isDevelopment
          ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
          : undefined,
      },
    };
  }
}
