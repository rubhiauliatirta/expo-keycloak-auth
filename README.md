# expo-keycloak-auth

> expo-auth-session wrapper for keycloak

[![NPM](https://img.shields.io/npm/v/expo-keycloak-auth.svg)](https://www.npmjs.com/package/expo-keycloak-auth) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

Install peer dependencies

```bash
expo install @react-native-async-storage/async-storage expo-auth-session expo-random
```

Install this library

```bash
expo install --save expo-keycloak-auth
```

## Usage

```jsx
import { KeycloakProvider, useKeycloak } from "expo-keycloak-auth";
import AppConfig from "./app.json";

export default function App() {
  const keycloakConfiguration = {
    clientId: "your-keycloak-clientId",
    realm: "master", // your realm name
    url: "https://your.keycloak.url.com/auth", // This is usually an url ending with /auth
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
    ready, // If the discovery is already fetched
    login, // The login function - opens the browser
    isLoggedIn, // Helper boolean to use e.g. in your components down the tree
    token, // Access token, if available
    logout, // Logs the user out
  } = useKeycloak();
  if (!ready) return <ActivityIndicator />;

  if (!isLoggedIn)
    return (
      <View style={{ margin: 24 }}>
        <Button title="get To" onPress={getToken} />
        <Button onPress={login} title={"Login"} />
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

## License

MIT © [rubhiauliatirta](https://github.com/rubhiauliatirta)
