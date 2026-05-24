import { jwtVerify } from 'jose';

interface Env {
  JWT_SECRET: string;
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const url = new URL(request.url);

  // Login page is public
  if (url.pathname === '/admin/login' || url.pathname === '/admin/login/') {
    return next();
  }

  const cookie = request.headers.get('Cookie') ?? '';
  const token = cookie.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=').slice(1).join('=').trim();

  if (!token) {
    return Response.redirect(new URL('/admin/login', request.url), 302);
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    await jwtVerify(token, secret);
    return next();
  } catch {
    return Response.redirect(new URL('/admin/login', request.url), 302);
  }
};
