import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';

import { apolloErrorLink } from '@/lib/apollo-error-link';

const graphqlUrl =
  import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

export const apolloClient = new ApolloClient({
  link: from([
    apolloErrorLink,
    new HttpLink({
      uri: graphqlUrl,
      credentials: 'include',
    }),
  ]),
  cache: new InMemoryCache(),
});