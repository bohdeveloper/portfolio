import { jwtVerify } from 'jose';

interface JWTPayload {
  user_id: number;
  username: string;
  role: 'super_admin' | 'user';
}

export async function verifyAuth(request: Request, jwtSecret: string): Promise<JWTPayload | null> {
  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';')
    .find(c => c.trim().startsWith('admin_token='))
    ?.split('=').slice(1).join('=').trim();

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

export function checkRole(requiredRoles: string | string[], userRole: string): boolean {
  if (typeof requiredRoles === 'string') {
    return userRole === requiredRoles;
  }
  return requiredRoles.includes(userRole);
}
