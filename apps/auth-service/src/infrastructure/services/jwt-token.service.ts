import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationException } from '../../common/exceptions/app.exception';
import { ClientUser } from '../../domain/entities/client-user.entity';
import { AuthTokenOutput, ITokenService, TokenPayload } from '../../domain/services/i-token.service';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly secrets: Record<UserRole, string>;
  private readonly clientExpiresInSeconds = 3600;
  private readonly publicExpiresInSeconds = 900;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const adminSecret = this.configService.get<string>('JWT_ADMIN_SECRET');
    const clientSecret = this.configService.get<string>('JWT_CLIENT_SECRET');
    const publicSecret = this.configService.get<string>('JWT_PUBLIC_SECRET');

    if (!adminSecret || !clientSecret || !publicSecret) {
      throw new ConfigurationException('JWT_TOKEN_SERVICE');
    }

    this.secrets = {
      [UserRole.ADMIN]: adminSecret,
      [UserRole.CLIENT]: clientSecret,
      [UserRole.PUBLIC]: publicSecret,
    };
  }

  public async generateClientUserAuthToken(user: ClientUser): Promise<AuthTokenOutput> {
    const role: UserRole = user.getRole();
    const secret = this.secrets[UserRole.CLIENT];

    const payload: TokenPayload = {
      sub: user.getId().toString(),
      email: user.getEmail(),
      clinicalInfo: user.getClinicalInfoId(),
      role,
      firstName: user.getFirstName(),
      iat: Date.now(),
      expiresIn: this.clientExpiresInSeconds,
    };

    const accessToken = await this.jwtService.signAsync(payload, { secret });

    return {
      accessToken,
      expiresIn: this.clientExpiresInSeconds,
    };
  }

  public async generatePublicAccessToken(recordId: string): Promise<AuthTokenOutput> {
    const secret = this.secrets[UserRole.PUBLIC];

    const payload: TokenPayload = {
      sub: recordId,
      firstName: null,
      email: null,
      clinicalInfo: null,
      role: UserRole.PUBLIC,
      iat: Date.now(),
      expiresIn: this.publicExpiresInSeconds,
    };

    const accessToken = await this.jwtService.signAsync(payload, { secret });

    return {
      accessToken,
      expiresIn: this.publicExpiresInSeconds,
    };
  }
}
