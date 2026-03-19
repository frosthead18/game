import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { LoggerModule } from 'nestjs-pino';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { GameSessionsModule } from '@modules/game-sessions/game-sessions.module';
import { LeaderboardModule } from '@modules/leaderboard/leaderboard.module';
import { HealthModule } from '@modules/health/health.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.loggerOptions,
    }),
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.', global: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    GameSessionsModule,
    LeaderboardModule,
    HealthModule,
  ],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
