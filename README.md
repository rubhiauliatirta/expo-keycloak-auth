# expo-keycloak-auth

> expo-auth-session wrapper for keycloak

This library is based on [balgamat/expo-keycloak](https://www.npmjs.com/package/expo-keycloak) written in Javascript with re-implementation of automatic token refresh handling.

[![NPM](https://img.shields.io/npm/v/expo-keycloak-auth.svg)](https://www.npmjs.com/package/expo-keycloak-auth)

## Install

Install peer dependencies

```bash
expo install @react-native-async-storage/async-storage expo-auth-session expo-random
```

Install this library

```bash
expo install expo-keycloak-auth
```

## Usage

```jsx
import React from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { KeycloakProvider, useKeycloak } from "expo-keycloak-auth";
import AppConfig from "./app.json";

export default function App() {
  const keycloakConfiguration = {
    clientId: "your-keycloak-clientId",
    realm: "master", // your realm name
    url: "https://your.keycloak.url.com/auth", // This is usually a url ending with /auth
    scheme: AppConfig.expo.scheme,
  };

  return (
    <KeycloakProvider {...keycloakConfiguration}>
      <View style={styles.container}>
        <Auth />
      </View>
    </KeycloakProvider>
  );
}

export const Auth = () => {
  const {
    ready, // If the discovery is already fetched and ready to prompt authentication flow
    login, // The login function - opens the browser
    isLoggedIn, // Helper boolean to use e.g. in your components down the tree
    token, // Access token, if available
    logout, // The logout function - Logs the user out
  } = useKeycloak();
  if (!ready) return <ActivityIndicator />;

  if (!isLoggedIn)
    return (
      <View style={{ margin: 24 }}>
        <Button onPress={login} title="Login" />
      </View>
    );

  return (
    <View style={{ margin: 24 }}>
      <Text style={{ fontSize: 17, marginBottom: 24 }}>Logged in!</Text>
      <Text>Your Access Token</Text>
      <TextInput value={token}></TextInput>
      <Button onPress={logout} title={"Logout"} style={{ marginTop: 24 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

## Configuration

Pass this configuration to `KeycloakProvider` as props:

| Props Name                   | Usage        | Default        | Description                                                                                                                                                                 |
| ---------------------------- | ------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| clientId (string)            | **required** |                | One of your keycloak clientId                                                                                                                                               |
| realm (string)               | **required** |                | One of your keycloak realm name                                                                                                                                             |
| url (string)                 | **required** |                | Your keycloak url. This is usually a url ending with /auth. This props (with realm) used to generate url `${url}/realms/${realm}` for expo `AuthSession.useAutoDiscovery()` |
| scheme (string)              | optional     |                | Your app scheme defined in `app.json`. This props used to generate redirect uri scheme for standalone app. `default redirect_uri = ${scheme}://redirect/auth`               |
| disableAutoRefresh (boolean) | optional     | false          |                                                                                                                                                                             |
| nativeRedirectPath (string)  | optional     | undefined      | Path to override default redirect path                                                                                                                                      |
| refreshTimeBuffer (number)   | optional     | 20             | time buffer in seconds to invoke `AuthSession.refreshAsync()` before token expires.                                                                                         |
| tokenStorageKey (string)     | optional     | keycloak_token | AsyncStorage key to save your token responses.                                                                                                                              |
| extraParams (object)         | optional     | undefined      | Extra query params that'll be added to the query string                                                                                                                     |

> NOTE: You must add the scheme value to your valid redirect URLs on Keycloak admin console. It has to be like: `${scheme}://*` being ${scheme} the current selected value from AppConfig.

## License

MIT © [rubhiauliatirta](https://github.com/rubhiauliatirta)
