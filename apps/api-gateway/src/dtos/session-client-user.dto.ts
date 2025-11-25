export interface AuthTokenOutput {
  accessToken: string;
  expiresIn: number | null;
}

export class SessionClientUserDto {
  id: string;
  firstName: string;
  email: string;
  clinicalInfo: string | null;
  role: string;
  accessToken: AuthTokenOutput;

  constructor(id: string, email: string, role: string, firstName: string, accessToken: AuthTokenOutput) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.firstName = firstName;
    this.accessToken = accessToken;
  }
}
