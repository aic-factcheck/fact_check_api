import {
  ExecutionContext,
  UnprocessableEntityException,
  createParamDecorator,
} from '@nestjs/common';

export const LoggedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnprocessableEntityException('No authorized user.');
    }
    return request.user;
  },
);
