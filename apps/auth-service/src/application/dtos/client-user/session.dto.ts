import { AuthTokenOutput } from '../../../domain/services/i-token.service';

export class SessionDto {
  id: string | number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  clinicalInfoId: string | null;
  role: string;
  accessToken: AuthTokenOutput;

  constructor(
    id: string,
    email: string | null,
    role: string,
    firstName: string | null,
    lastName: string | null,
    accessToken: AuthTokenOutput,
    clinicalInfoId: string | null,
  ) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.firstName = firstName;
    this.lastName = lastName;
    this.accessToken = accessToken;
    this.clinicalInfoId = clinicalInfoId;
  }
}
