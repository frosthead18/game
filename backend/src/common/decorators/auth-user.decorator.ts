import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '@common/types';

const AUTH_USER_META_KEY = 'authUser';

export function setAuthUser(req: Request, user: AuthenticatedUser): void {
  Reflect.defineMetadata(AUTH_USER_META_KEY, user, req);
}

export function getAuthUser(req: Request): AuthenticatedUser | undefined {
  return Reflect.getMetadata(AUTH_USER_META_KEY, req) as AuthenticatedUser | undefined;
}

export const AuthUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return getAuthUser(request) as AuthenticatedUser;
});
