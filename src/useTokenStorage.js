import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from "react-native"
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
  const appState = useRef(AppState.currentState);
  const refreshTime = useRef(null)
  const tokenData = useRef(null)

  async function updateAndSaveToken(newToken) {
    try {
      setToken(newToken)
      if (newToken !== null) {
        const stringifiedValue = JSON.stringify(newToken);
        await setItem(stringifiedValue)
      } else {
        if(refreshHandler.current) {
          clearTimeout(refreshHandler.current)
        }
        refreshHandler.current = null;
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
          return updateAndSaveToken(tokenResponse)
        })
        .catch(err => {
          if(err.message === "Network request failed" || err.message === "Failed to fetch") {
            console.debug("Cannot contact auth server, retrying!")
            if (refreshHandler.current)
              clearTimeout(refreshHandler.current);
            refreshHandler.current = setTimeout(() => handleTokenRefresh(token), 2000)
          } else {
            console.debug(err)
            updateAndSaveToken(null)
          }
        })
  }

  useEffect(() => {
    const handleAppState = nextAppState => {
      if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
      ) {
        if (refreshHandler.current !== null) {
          clearTimeout(refreshHandler.current)
          const now = getCurrentTimeInSeconds()
          const timeout = 1000 * (refreshTime.current - now)
          refreshHandler.current = setTimeout(() => {
            if(tokenData.current !== null) {
              handleTokenRefresh(tokenData.current)
            } else {
              console.debug("token was reset");
            }
          }, timeout)
        }
      }
      appState.current = nextAppState;
    }
    const subscription = AppState.addEventListener("change", handleAppState);

    return () => {
      if (subscription) {
        subscription.remove()
      } else {
        AppState.removeEventListener("change", handleAppState)
      }
    };
  }, [discovery]);

  useEffect(() => {
    async function getTokenFromStorage() {
      try {
        const tokenFromStorage = await getItem()
        if (!tokenFromStorage && !tokenData.current) {
          console.info("No token in storage")
          setToken(null);
        } else {
          const token = JSON.parse(tokenFromStorage)
          if (!TokenResponse.isTokenFresh(token, -refreshTimeBuffer)) {
            handleTokenRefresh(token)
          } else {
            setToken(token)
          }
        }
      } catch (error) {
        console.error(error);
        setToken(null)
      }
    }
    if (!!discovery) getTokenFromStorage()
  }, [discovery]);

  useEffect(() => {
    // trigger every token update
    tokenData.current = token
    if (token !== undefined && !disableAutoRefresh) {

      if (refreshHandler.current !== null) {
        clearTimeout(refreshHandler.current)
      }
      if (token !== null && token.expiresIn) {
        const now = getCurrentTimeInSeconds()
        refreshTime.current = token.issuedAt + token.expiresIn - refreshTimeBuffer

        const timeout = 1000 * (refreshTime.current - now)
        refreshHandler.current = setTimeout(() => {
          handleTokenRefresh(token)
        }, timeout)
      }
      if (token === null && tokenData.current !== null) {
        AuthSession.revokeAsync(
            { token: tokenData.current?.accessToken, ...config }, discovery
        )
        Platform.OS === 'ios' && AuthSession.dismiss();
        refreshTime.current = null
        tokenData.current = null
      }
    }
  }, [token, discovery])


  return [token, updateAndSaveToken];
};

export default useTokenStorage;