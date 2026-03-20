import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { ConfigService } from '@config/config.service';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  username: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly verifier: ReturnType<typeof CognitoJwtVerifier.create>;

  constructor(private readonly configService: ConfigService) {
    const { userPoolId, clientId } = this.configService.cognitoVerifierConfig;
    this.verifier = CognitoJwtVerifier.create({
      userPoolId,
      clientId,
      tokenUse: 'access',
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token =
      (client.handshake.auth as Record<string, string>)['token'] ??
      (client.handshake.headers['authorization'] as string | undefined)?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    const payload = await this.verifier.verify(token).catch(() => {
      throw new UnauthorizedException('Invalid auth token');
    });

    (client as AuthenticatedSocket).userId = payload.sub;
    (client as AuthenticatedSocket).username = (payload['preferred_username'] as string | undefined) ?? payload.sub;
    return true;
  }
}
