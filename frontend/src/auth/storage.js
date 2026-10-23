const ACCESS = 'devapi_access';
const REFRESH = 'devapi_refresh';

export function getAccessToken() {
  return localStorage.getItem(ACCESS);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH);
}

export function saveTokens({ accessToken, refreshToken }) {
  localStorage.setItem(ACCESS, accessToken);
  localStorage.setItem(REFRESH, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}
