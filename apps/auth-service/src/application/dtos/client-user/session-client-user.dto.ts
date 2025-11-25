import { AuthTokenOutput } from '../../../domain/services/i-token.service';

export class SessionClientUserDto {
  id: string;
  firstName: string;
  email: string;
  clinicalInfo: string | null;
  role: string;
  accessToken: AuthTokenOutput;

  constructor(id: string, email: string, role: string, firstName: string, accessToken: AuthTokenOutput, clinicalInfo: string | null) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.firstName = firstName;
    this.accessToken = accessToken;
    this.clinicalInfo = clinicalInfo;
  }
}
