import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { setAuthUser } from '@common/decorators/auth-user.decorator';
import { ConfigService } from '@config/config.service';
import { User } from '@modules/users/user.entity';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private readonly verifier: ReturnType<typeof CognitoJwtVerifier.create>;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectPinoLogger(CognitoAuthGuard.name) private readonly logger: PinoLogger,
  ) {
    const { userPoolId, clientId } = this.configService.cognitoVerifierConfig;
    this.verifier = CognitoJwtVerifier.create({
      userPoolId,
      clientId,
      tokenUse: 'access',
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const [, token] = (request.headers.authorization ?? '').split(' ');

    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    const verified = await this.verifier
      .verify(token)
      .catch(() => {
        throw new UnauthorizedException('Invalid or expired token');
      });

    const user = await this.userRepository.findOne({ where: { cognitoSub: verified.sub } });
    if (!user) {
      this.logger.warn({ cognitoSub: verified.sub }, 'Cognito token valid but user not found in DB');
      throw new UnauthorizedException('User not found');
    }

    setAuthUser(request, {
      id: user.id,
      cognitoSub: user.cognitoSub,
      username: user.username,
      role: user.role,
    });

    return true;
  }
}
