import { randomBytes } from 'crypto';

export const SESSION_COOKIE = 'admin_session';
export const CSRF_COOKIE = 'admin_csrf';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function credentialsMatch(username: unknown, password: unknown) {
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin888';
  if (!expectedUsername || !expectedPassword || typeof username !== 'string' || typeof password !== 'string') return false;
  return username === expectedUsername && password === expectedPassword;
}

export function createCsrfToken() {
  return randomBytes(32).toString('base64url');
}

function parseCookies(request: Request) {
  return Object.fromEntries(
    (request.headers.get('cookie') || '').split(';').map(part => {
      const index = part.indexOf('=');
      return index < 0 ? ['', ''] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
    }).filter(([name]) => name)
  );
}

export function hasAdminSession(request: Request) {
  return parseCookies(request)[SESSION_COOKIE] === 'authenticated_admin';
}

export function isTrustedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  // Browser mutations must originate from the production site. Requests without
  // an Origin header are rejected to avoid accepting cross-site form posts.
  return origin === 'https://www.gitxu.com' || origin === 'https://gitxu.com';
}

export function isAuthorizedMutation(request: Request) {
  if (!hasAdminSession(request) || !isTrustedOrigin(request)) return false;
  const csrfHeader = request.headers.get('x-csrf-token') || '';
  const cookies = parseCookies(request);
  return csrfHeader.length >= 32 && csrfHeader === cookies[CSRF_COOKIE];
}
