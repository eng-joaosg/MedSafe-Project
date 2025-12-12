import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationException } from '../../common/exceptions/app.exception';
import { ClientUser } from '../../domain/entities/client-user.entity';
import { AuthTokenOutput, ITokenService, TokenPayload } from '../../domain/services/i-token.service';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly clientExpiresInSeconds = 3600;
  private readonly publicExpiresInSeconds = 900;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new ConfigurationException('JWT_TOKEN_SERVICE');
    }

    this.secret = secret;
  }

  public async generateClientUserAuthToken(user: ClientUser): Promise<AuthTokenOutput> {
    const payload: TokenPayload = {
      sub: user.getId().toString(),
      email: user.getEmail(),
      clinicalInfo: user.getClinicalInfoId(),
      role: user.getRole(),
      firstName: user.getFirstName(),
      iat: Date.now(),
      expiresIn: this.clientExpiresInSeconds,
    };

    const accessToken = await this.jwtService.signAsync(payload, { secret: this.secret });

    return {
      accessToken,
      expiresIn: this.clientExpiresInSeconds,
    };
  }

  public async generatePublicAccessToken(recordId: string): Promise<AuthTokenOutput> {
    const payload: TokenPayload = {
      sub: recordId,
      firstName: null,
      email: null,
      clinicalInfo: null,
      role: UserRole.PUBLIC,
      iat: Date.now(),
      expiresIn: this.publicExpiresInSeconds,
    };

    const accessToken = await this.jwtService.signAsync(payload, { secret: this.secret });

    return {
      accessToken,
      expiresIn: this.publicExpiresInSeconds,
    };
  }

  public async verifyToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token, { secret: this.secret });
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
