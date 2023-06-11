import {createCookieSessionStorage} from '@vercel/remix'; // or cloudflare/deno
import invariant from 'tiny-invariant';

const sessionSecret = process.env.SESSION_SECRET;

invariant(sessionSecret, 'No session secret defined');

const {getSession, commitSession, destroySession} = createCookieSessionStorage({
  // a Cookie from `createCookie` or the CookieOptions to create one
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
  },
});

export {getSession, commitSession, destroySession};
