import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ConfigService } from '@config/config.service';
import { JwtPayload } from '@common/types';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  username: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token =
      (client.handshake.auth as Record<string, string>)['token'] ??
      (client.handshake.headers['authorization'] as string | undefined)?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.jwtAccessSecret,
      });
      (client as AuthenticatedSocket).userId = payload.sub;
      (client as AuthenticatedSocket).username = payload.username;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid auth token');
    }
  }
}
