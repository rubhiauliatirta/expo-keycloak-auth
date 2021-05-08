import React, { useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import {
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session';
import { KeycloakContext } from './KeycloakContext';
import useTokenStorage from './useTokenStorage';
import { handleTokenExchange, getRealmURL } from './helpers';
import {
  NATIVE_REDIRECT_PATH,
} from './const';

// export interface IKeycloakConfiguration extends Partial<AuthRequestConfig> {
//   clientId: string;
//   disableAutoRefresh?: boolean;
//   nativeRedirectPath?: string;
//   realm: string;
//   refreshTimeBuffer?: number;
//   scheme?: string;
//   tokenStorageKey?: string;
//   url: string;
// }


export const KeycloakProvider = ({ realm, clientId, url, children, ...options }) => {

  const discovery = useAutoDiscovery(getRealmURL({ realm, url }));
  const redirectUri = AuthSession.makeRedirectUri({
    native: `${options.scheme ?? 'exp'}://${options.nativeRedirectPath ?? NATIVE_REDIRECT_PATH}`,
    useProxy: !options.scheme,
  });

  const config = { redirectUri, clientId, realm, url }

  const [request, response, promptAsync] = useAuthRequest(
    { usePKCE: false, ...config },
    discovery,
  );
  const [currentToken, updateToken] = useTokenStorage(options, config, discovery)

  const handleLogin = async () => {
    return promptAsync();
  }

  const handleLogout = () => {
    if (!currentToken) throw new Error('Not logged in.');
    try {
      if (discovery.revocationEndpoint) {
        AuthSession.revokeAsync(
          { token: currentToken?.accessToken, ...config }, discovery
        )
      }
      AuthSession.dismiss();
    } catch (error) {
      console.log(error)
    }

    updateToken(null)
  }
  useEffect(() => {
    if (response) {
      handleTokenExchange({ response, discovery, config })
        .then(updateToken)
    }
  }, [response])

  return (
    <KeycloakContext.Provider
      value={{
        isLoggedIn: !!currentToken,
        login: handleLogin,
        logout: handleLogout,
        ready: discovery !== null && request !== null && currentToken !== undefined,
        token: currentToken,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};
