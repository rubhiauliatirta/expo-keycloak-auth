import * as AuthSession from "expo-auth-session";
export const getRealmURL = (config) => {
  const { url, realm } = config;
  const slash = url.endsWith('/') ? '' : '/';
  return `${url + slash}realms/${encodeURIComponent(realm)}`;
};

export function getCurrentTimeInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export const handleTokenExchange = async ({
  response,
  discovery,
  config,
}) => {
  try {
    if (response?.type === 'success' && !!(discovery?.tokenEndpoint)) {
      const token = await AuthSession.exchangeCodeAsync(
        { code: response.params.code, ...config },
        discovery,
      );
      return token;
    }
    if (response?.type === 'error') {
      return null;
    }
    return null;
  } catch (error) {
    return null;
  }
};
