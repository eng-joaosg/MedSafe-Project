export class ClientUserDbtDto {
  id?: string;
  email?: string;
  password_hash?: string;
  clinical_info_id?: string | null;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  verification_code?: string | null;
  code_expires_at?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}
