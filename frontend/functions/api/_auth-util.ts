import { jwtVerify } from 'jose';

interface JWTPayload {
  user_id: number;
  username: string;
  role: 'super_admin' | 'user';
}

export async function verifyAuth(request: Request, jwtSecret: string): Promise<JWTPayload | null> {
  // El token JWT viaja en una cookie httpOnly llamada admin_token.
  // Se lee directamente del header Cookie (no es accesible desde JS del cliente),
  // lo que protege contra ataques XSS que intenten robar la sesión.
  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';')
    .find(c => c.trim().startsWith('admin_token='))
    // slice(1).join('=') reconstruye el valor si el propio token contiene '=' (padding base64)
    ?.split('=').slice(1).join('=').trim();

  if (!token) return null;

  try {
    // jwtVerify valida la firma HMAC-SHA256 y la expiración del token en un solo paso.
    // Si el token ha sido manipulado o expirado, lanza excepción y se devuelve null.
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
