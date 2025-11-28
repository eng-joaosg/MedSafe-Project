import { ClientUser } from '../entities/client-user.entity';

export interface ITokenService {
  generateClientUserAuthToken(user: ClientUser): Promise<AuthTokenOutput>;
  generatePublicAccessToken(recordId: string): Promise<AuthTokenOutput>;
  verifyToken(token: string): Promise<TokenPayload>;
}

export interface TokenPayload {
  sub: string | number;
  firstName: string | null;
  email: string | null;
  clinicalInfo: string | null;
  role: 'admin' | 'client' | 'public';
  iat: number;
  expiresIn: number | null;
}

export interface AuthTokenOutput {
  accessToken: string;
  expiresIn: number | null;
}
