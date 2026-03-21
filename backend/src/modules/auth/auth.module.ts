import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@config/config.service';
import { User } from '@modules/users/user.entity';
import { AuthService, COGNITO_CLIENT } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: COGNITO_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new CognitoIdentityProviderClient(configService.cognitoClientConfig),
    },
    AuthService,
  ],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
