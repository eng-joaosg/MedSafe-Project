export interface TokenPayload {
  sub: string | number;
  firsttName: string | null;
  email: string | null;
  clinicalInfo: string | null;
  role: string;
  iat: number;
  exp: number | null;
}
