import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

export const Cookiegetter = createParamDecorator(
  async (data: string, context: ExecutionContext): Promise<String> => {
    const request = context.switchToHttp().getRequest();
    const refresh_token = request.cookies[data];
    if (!refresh_token) {
      throw new UnauthorizedException('Token is not found');
    }
    return refresh_token;
  },
);
