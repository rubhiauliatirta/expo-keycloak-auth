import { useContext, useMemo } from 'react';
import { KeycloakContext } from './KeycloakContext';
import atob from "./atob"
const parseToken = (token) => {
  try {
    if(token) {
      let splitted = token.split(".")[1];
      let decoded = atob(unescape(encodeURIComponent( splitted ))).toString()
      return JSON.parse(decoded);
    }
  }catch(e) {
    console.error(e)
  }
}
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
    token: token?.accessToken ?? null,
    tokenParsed: parseToken(token?.accessToken)
  }
}
