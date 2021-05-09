export const KC_INITIAL_VALUE = {
  ready: false,
  isLoggedIn: false,
  login: () => console.error('KC Not Initialized.'),
  logout: () => console.error('Not Logged In.'),
  tokens: null,
};
export const NATIVE_REDIRECT_PATH = 'auth/redirect';
export const TOKEN_STORAGE_KEY = 'keycloak_token';
export const REFRESH_TIME_BUFFER = 20;