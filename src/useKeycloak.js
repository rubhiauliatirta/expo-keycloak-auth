import { useContext, useMemo } from 'react';
import { KeycloakContext } from './KeycloakContext';

export const useKeycloak = () => {
  const {
    isLoggedIn,
    login,
    logout,
    ready = false,
    token = null,
  } = useContext(KeycloakContext);

  return {
    isLoggedIn,
    login,
    logout,
    ready,
    token: token?.accessToken ?? null
  }
}
