import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    try {
      const request = context.switchToHttp().getRequest()
      const isvalidBearerToken = this.extractTokenFromHeader(request)
      if (!isvalidBearerToken) {
        return false
      }

      const decode = await this.jwtService.verifyAsync(isvalidBearerToken)

      if (!decode) {
        return false
      }

      request["user"] = decode


      return true;
    } catch (error) {
      console.error(error)
      return false
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    //@ts-expect-error
    const [type, token] = request?.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

}
