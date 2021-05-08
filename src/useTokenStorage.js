import { useEffect, useRef, useState } from 'react';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { REFRESH_TIME_BUFFER, TOKEN_STORAGE_KEY } from './const';
import { getCurrentTimeInSeconds } from "./helpers"
import * as AuthSession from "expo-auth-session";
import { TokenResponse } from "expo-auth-session";

const useTokenStorage = ({
  tokenStorageKey = TOKEN_STORAGE_KEY,
  refreshTimeBuffer = REFRESH_TIME_BUFFER,
  disableAutoRefresh = false
}, config, discovery) => {

  const [token, setToken] = useState()
  const { getItem, setItem, removeItem } = useAsyncStorage(tokenStorageKey);
  const refreshHandler = useRef(null)

  async function updateAndSaveToken(newToken) {
    try {
      setToken(newToken)
      if (newToken !== null) {
        const stringifiedValue = JSON.stringify(newToken);
        await setItem(stringifiedValue)
      } else {
        await removeItem()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleTokenRefresh = (token) => {
    AuthSession.refreshAsync(
      { refreshToken: token.refreshToken, ...config },
      discovery
    )
      .then((tokenResponse) => {
        updateAndSaveToken(tokenResponse)
      })
      .catch(err => {
        updateAndSaveToken(null)
      })
  }

  useEffect(() => {
    async function getTokenFromStorage() {
      try {
        const tokenFromStorage = await getItem()
        if (!tokenFromStorage) {
          throw new Error("No token in storage")
        }
        const token = JSON.parse(tokenFromStorage)
        if (!TokenResponse.isTokenFresh(token, -refreshTimeBuffer)) {
          handleTokenRefresh(token)
        } else {
          setToken(token)
        }
      } catch (error) {
        setToken(null)
      }
    }
    if (!!discovery) getTokenFromStorage()
  }, [discovery]);

  useEffect(() => {
    // trigger every token update
    if (token !== undefined && !disableAutoRefresh) {

      if (refreshHandler.current !== null) {
        clearTimeout(refreshHandler.current)
      }
      if (token !== null && token.expiresIn) {
        const now = getCurrentTimeInSeconds()
        const timeout = 1000 * ((token.issuedAt + token.expiresIn - refreshTimeBuffer) - now)
        refreshHandler.current = setTimeout(() => {
          handleTokenRefresh(token)
        }, timeout)
      }
    }
  }, [token])


  return [token, updateAndSaveToken];
};

export default useTokenStorage;
