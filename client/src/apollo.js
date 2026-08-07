import ApolloClient from 'apollo-boost'

// apollo-boost is Apollo Client with the four things almost everybody wants already
// wired together: an HTTP link, an in-memory cache, error handling and the query
// deduplicator. Assembling those by hand is the thing it saves you, and in 2019 it was
// the standard starting point.
//
// The endpoint is configurable, and Vue CLI only exposes VUE_APP_-prefixed variables to
// the bundle. They are inlined at build time, so this is configuration and not a place
// for a secret.
export const apolloClient = new ApolloClient({
  uri: process.env.VUE_APP_GRAPHQL_URI || 'http://localhost:9020/'
})
