export interface FindEmailPayload {
  action: 'findEmailClientUser';
  email: string;
}

export interface RegisterClientUserPayload {
  action: 'registerClientUser';
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
