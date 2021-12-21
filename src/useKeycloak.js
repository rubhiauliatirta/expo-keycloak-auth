import { useContext, useMemo } from 'react';
import { KeycloakContext } from './KeycloakContext';
const parseToken = (token) => {
  try {
    if(token) {
      let splitted = token.split(".")[1];
      if(typeof Buffer !== "undefined") {
        let decoded = Buffer.from(splitted,'base64').toString();
        return JSON.parse(decoded);
      } else {

        let decoded = window.atob(unescape(encodeURIComponent( splitted ))).toString()
        return JSON.parse(decoded);
      }
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
