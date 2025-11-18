export class ClientUserDbtDto {
  id: string;
  email: string;
  password_hash: string;
  clinical_info_id: string | null;
  first_name: string;
  last_name: string;
  is_active: boolean;
  verification_code: string | null;
  code_expires_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;

  constructor(
    id: string,
    email: string,
    password_hash: string,
    clinical_info_id: string | null,
    first_name: string,
    last_name: string,
    is_active: boolean,
    verification_code: string | null,
    code_expires_at: Date | null,
    created_at: Date | null,
    updated_at: Date | null,
  ) {
    this.id = id;
    this.email = email;
    this.password_hash = password_hash;
    this.clinical_info_id = clinical_info_id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.is_active = is_active;
    this.verification_code = verification_code;
    this.code_expires_at = code_expires_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
