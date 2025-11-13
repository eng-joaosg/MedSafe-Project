export interface TokenPayload {
  id: string;
  name: string;
  email: string;
  clinicalInfo?: string;
  role?: string;
  iat?: number;
  exp?: number;
}
