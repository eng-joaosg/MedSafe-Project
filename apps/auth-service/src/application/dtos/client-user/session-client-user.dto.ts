import { AuthTokenOutput } from '../../../domain/services/i-token.service';

export class SessionClientUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  clinicalInfo: string | null;
  role: string;
  accessToken: AuthTokenOutput;

  constructor(
    id: string,
    email: string,
    role: string,
    firstName: string,
    lastName: string,
    accessToken: AuthTokenOutput,
    clinicalInfoId: string | null,
  ) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.firstName = firstName;
    this.lastName = lastName;
    this.accessToken = accessToken;
    this.clinicalInfo = clinicalInfoId;
  }
}
