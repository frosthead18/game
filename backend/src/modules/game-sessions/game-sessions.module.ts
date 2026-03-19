import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { GameSession } from './game-session.entity';
import { GameSessionPlayer } from './game-session-player.entity';
import { GameSessionsService } from './game-sessions.service';
import { GameSessionsController } from './game-sessions.controller';
import { GameSessionsGateway } from './game-sessions.gateway';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameSession, GameSessionPlayer]),
    JwtModule.register({}),
  ],
  providers: [GameSessionsService, GameSessionsGateway, WsJwtGuard],
  controllers: [GameSessionsController],
})
export class GameSessionsModule {}
