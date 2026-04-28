/**
 * Decode a JWT payload without verifying signature.
 * Used only to read the role claim on the frontend.
 */
export const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    console.debug('[JWT Decode]', decoded);
    return decoded;
  } catch (e) {
    console.error('[JWT Decode Error]', e);
    return null;
  }
};

/**
 * Extract role from JWT.
 * Spring Security stores roles as "ROLE_USER" or "ROLE_ADMIN"
 * inside the "authorities" or "roles" claim.
 */
export const getRoleFromToken = (token) => {
  const payload = decodeJwt(token);
  if (!payload) return null;

  // Try common claim names used by Spring Security / jjwt
  const authorities = payload.authorities || payload.roles || payload.role || [];
  const list = Array.isArray(authorities) ? authorities : [authorities];

  if (list.some((r) => r === 'ROLE_ADMIN' || r === 'ADMIN')) return 'ADMIN';
  if (list.some((r) => r === 'ROLE_USER' || r === 'USER')) return 'USER';

  // Fallback: check sub claim for "admin" keyword (not reliable but safe default)
  return 'USER';
};

export const isTokenExpired = (token) => {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};
