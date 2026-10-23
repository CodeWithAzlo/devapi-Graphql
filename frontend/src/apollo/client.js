import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAccessToken } from '../auth/storage.js';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

const httpLink = new HttpLink({ uri: graphqlUrl });

// Runs before every GraphQL request. Adds the JWT if we have one.
const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
