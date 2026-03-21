import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  NotAuthorizedException,
  UsernameExistsException,
  CodeMismatchException,
  ExpiredCodeException,
  UserNotConfirmedException,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@config/config.service';
import { User } from '@modules/users/user.entity';
import {
  SignUpDto,
  ConfirmSignUpDto,
  SignInDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  CognitoTokenResponseDto,
} from './auth.dto';

export const COGNITO_CLIENT = 'COGNITO_CLIENT';

@Injectable()
export class AuthService {
  private readonly clientId: string;

  constructor(
    @Inject(COGNITO_CLIENT) private readonly cognitoClient: CognitoIdentityProviderClient,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    @InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
  ) {
    this.clientId = this.configService.cognitoVerifierConfig.clientId;
  }

  async signUp(dto: SignUpDto): Promise<{ userSub: string }> {
    const existing = await this.userRepository.findOne({ where: [{ email: dto.email }, { username: dto.username }] });
    if (existing) {
      throw new ConflictException('Username or email already taken');
    }

    try {
      const result = await this.cognitoClient.send(
        new SignUpCommand({
          ClientId: this.clientId,
          Username: dto.email,
          Password: dto.password,
          UserAttributes: [
            { Name: 'email', Value: dto.email },
            { Name: 'preferred_username', Value: dto.username },
          ],
        }),
      );

      const cognitoSub = result.UserSub!;
      const user = this.userRepository.create({
        cognitoSub,
        username: dto.username,
        email: dto.email,
      });
      await this.userRepository.save(user);
      this.logger.info({ cognitoSub }, 'User registered');

      return { userSub: cognitoSub };
    } catch (err) {
      if (err instanceof UsernameExistsException) {
        throw new ConflictException('An account with this email already exists');
      }
      throw err;
    }
  }

  async confirmSignUp(dto: ConfirmSignUpDto): Promise<void> {
    try {
      await this.cognitoClient.send(
        new ConfirmSignUpCommand({
          ClientId: this.clientId,
          Username: dto.email,
          ConfirmationCode: dto.code,
        }),
      );
    } catch (err) {
      if (err instanceof CodeMismatchException || err instanceof ExpiredCodeException) {
        throw new BadRequestException('Invalid or expired confirmation code');
      }
      throw err;
    }
  }

  async signIn(dto: SignInDto): Promise<CognitoTokenResponseDto> {
    try {
      const result = await this.cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
          ClientId: this.clientId,
          AuthParameters: {
            USERNAME: dto.email,
            PASSWORD: dto.password,
          },
        }),
      );

      const auth = result.AuthenticationResult!;
      return {
        accessToken: auth.AccessToken!,
        idToken: auth.IdToken,
        refreshToken: auth.RefreshToken,
        expiresIn: auth.ExpiresIn,
      };
    } catch (err) {
      if (err instanceof NotAuthorizedException) {
        throw new UnauthorizedException('Invalid email or password');
      }
      if (err instanceof UserNotConfirmedException) {
        throw new UnauthorizedException('Account not confirmed. Please check your email.');
      }
      throw err;
    }
  }

  async refresh(dto: RefreshDto): Promise<CognitoTokenResponseDto> {
    try {
      const result = await this.cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
          ClientId: this.clientId,
          AuthParameters: {
            REFRESH_TOKEN: dto.refreshToken,
          },
        }),
      );

      const auth = result.AuthenticationResult!;
      return {
        accessToken: auth.AccessToken!,
        idToken: auth.IdToken,
        expiresIn: auth.ExpiresIn,
      };
    } catch (err) {
      if (err instanceof NotAuthorizedException) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw err;
    }
  }

  async signOut(accessToken: string): Promise<void> {
    try {
      await this.cognitoClient.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    } catch (err) {
      if (err instanceof NotAuthorizedException) {
        throw new UnauthorizedException('Invalid token');
      }
      throw err;
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    await this.cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: dto.email,
      }),
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    try {
      await this.cognitoClient.send(
        new ConfirmForgotPasswordCommand({
          ClientId: this.clientId,
          Username: dto.email,
          ConfirmationCode: dto.code,
          Password: dto.newPassword,
        }),
      );
    } catch (err) {
      if (err instanceof CodeMismatchException || err instanceof ExpiredCodeException) {
        throw new BadRequestException('Invalid or expired reset code');
      }
      throw err;
    }
  }
}
