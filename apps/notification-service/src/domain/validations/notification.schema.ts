import { z } from 'zod';

export const EnvelopeSchema = z.object({
  id: z.string().min(10),
  type: z.enum(['verification', 'password_recovery', 'account_created', 'public_data_access']),
  version: z.number().int().min(1),
  payload: z.unknown(),
});

export const VerificationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  verificationCode: z.string().min(4).max(12),
});

export const PasswordRecoverySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  resetToken: z.string().min(6),
});

export const AccountCreatedSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const PublicDataAccessSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  accessedAt: z.string().datetime(),
});
