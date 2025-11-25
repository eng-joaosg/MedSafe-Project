export interface FindEmailPayload {
  email: string;
}

export interface RegisterClientUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface VerifyAccountClientUserPayload {
  email: string;
  verificationCode: string;
}

export interface LoginClientUserPayload {
  email: string;
  password: string;
}
