export const onRequestPost: PagesFunction = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'admin_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    },
  });
};
