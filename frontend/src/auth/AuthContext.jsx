import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { gql, useApolloClient, useLazyQuery } from '@apollo/client';
import { clearTokens, saveTokens } from './storage.js';

const ME = gql`
  query Me {
    currentUser {
      id
      name
      email
    }
  }
`;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const client = useApolloClient();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loadMe] = useLazyQuery(ME, { fetchPolicy: 'network-only' });

  useEffect(() => {
    loadMe()
      .then((res) => setUser(res.data?.currentUser || null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, [loadMe]);

  const value = useMemo(
    () => ({
      user,
      ready,
      async onLoggedIn(payload) {
        saveTokens(payload);
        setUser(payload.user);
        await client.resetStore();
      },
      async logout() {
        clearTokens();
        setUser(null);
        await client.clearStore();
      },
    }),
    [user, ready, client]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
