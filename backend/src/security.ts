import { jwtVerify } from 'jose';
import { z } from 'zod';

export const roles = ['platform_admin','reseller_admin','tenant_owner','tenant_admin','supervisor','qa','agent','auditor'] as const;
export const Principal = z.object({
  sub: z.string().uuid(), tenantId: z.string().uuid().nullable(), resellerId: z.string().uuid().nullable(),
  role: z.enum(roles), permissions: z.array(z.string()).default([])
});
export type Principal = z.infer<typeof Principal>;

export async function verifyToken(token: string): Promise<Principal> {
  const secret = process.env.LLAMAR_SECRET_KEY;
  if (!secret || secret.length < 32) throw new Error('LLAMAR_SECRET_KEY must be at least 32 characters');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
    issuer: process.env.LLAMAR_TOKEN_ISSUER ?? 'llamar-control-plane', audience: 'llamar-api', algorithms: ['HS256']
  });
  return Principal.parse(payload);
}

export function can(principal: Principal, permission: string): boolean {
  return principal.role === 'platform_admin' || principal.permissions.includes(permission);
}
