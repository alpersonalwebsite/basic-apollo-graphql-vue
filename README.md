# Vue + Apollo GraphQL

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

A Vue 2 client querying an Apollo GraphQL server through `vue-apollo`, with an
in-memory server in the same repository so it runs with two commands and no database.

## Why this exists next to `basic-apollo-graphql`

[basic-apollo-graphql](https://github.com/alpersonalwebsite/basic-apollo-graphql) does
the same thing with **no client library at all**: a hand-written `fetch` POSTing a query
string. Read that one first, then this one. The difference is the point.

Here is the whole of a query in this repo:

```js
apollo: {
  getUsers: {
    query: GET_USERS,
    error(err) { this.error = err.message }
  }
}
```

`vue-apollo` runs it, puts the result on `this.getUsers` by matching the property name,
exposes `$apollo.queries.getUsers.loading`, and caches it. The hand-written version
needed a `loading` flag, an `error` field, a `.catch`, a check that `errors` and `data`
can both be present, and a guard against destructuring `undefined`. Four of those five
were bugs in the first version of that repo.

What you give up is that all of it is now happening somewhere you cannot see, which is
why it is worth having written the raw version once.

| File | Role |
| --- | --- |
| `client/src/apollo.js` | the `apollo-boost` client: HTTP link, cache, error handling, deduplication |
| `client/src/main.js` | `Vue.use(VueApollo)` and the provider |
| `client/src/queries.js` | the documents, parsed by `graphql-tag` |
| `client/src/components/UserList.vue` | a declarative query, plus a delete mutation |
| `client/src/components/AddUser.vue` | a mutation with variables and error rendering |
| `apollo-server/src/index.js` | the server: same schema as the sibling repos |

## Running it

Two terminals:

```shell
cd apollo-server && yarn install && yarn dev     # http://localhost:9020
cd client        && yarn install && yarn serve   # http://localhost:8080
```

The client's endpoint is `VUE_APP_GRAPHQL_URI`, defaulting to `http://localhost:9020/`.
Vue CLI only exposes `VUE_APP_`-prefixed variables to the bundle and **inlines them at
build time**, so they ship inside `dist/js/*.js` in plain sight: fine for an endpoint,
never for a secret.

Two ports means two origins, so the server allows exactly the client's and nothing else,
rather than `cors: true`.

## The two things a client library does not do for you

**Mutations do not update the cache.** Apollo has no idea that deleting a user
invalidates the users list, so it has to be told. Both mutations here use
`refetchQueries`, which is the blunt option and the honest one for a demo. The
alternative is writing the new list into the cache yourself with `update`, which is
faster and much easier to get subtly wrong.

**Errors still need somewhere to go.** A query with no `error` handler throws at the
component and surfaces as an unhandled rejection rather than as anything the template can
render. `UserList` has one; the mutations use `try`/`catch`.

The server raises `UserInputError` for a duplicate id, so `AddUser` receives
`BAD_USER_INPUT` and shows the message. A bare `Error` on the server would have arrived
as `INTERNAL_SERVER_ERROR`, which reads to a client like "retry later" instead of "pick
another id".

## Where this repo came from

It had no source and no `package.json`. What it *did* have was two committed
`yarn.lock` files and seventeen commits, every one of them a bot bumping a dependency in
them. So the lockfiles were the only record of what this was meant to be, and both
manifests here are reconstructed from them: `apollo-server ^2.9.7` and `graphql ^14.5.8`
on the server, `vue ^2.6.10`, `vue-apollo ^3.0.0`, `apollo-boost ^0.4.4` and
`@vue/cli-service ^4.0.0` on the client. Installing against the untouched lockfiles
resolves exactly the versions they already pinned: `apollo-server` 2.19.2, `graphql`
14.7.0, `vue` 2.6.12, `vue-apollo` 3.0.5, `apollo-boost` 0.4.9.

Two deliberate departures from them:

- The server lockfile also pinned `mongoose ^5.7.7`, so a database was clearly the
  original intent. It is left out, because it would duplicate
  [basic-apollo-graphql-mongodb](https://github.com/alpersonalwebsite/basic-apollo-graphql-mongodb)
  and force anyone who wants to read Vue code to run a database first.
- `graphql` is now a declared dependency of the client. It was not in the original
  lockfile, arriving only transitively as a peer of `apollo-boost` and `graphql-tag`.
  `queries.js` imports `graphql-tag` and the client genuinely needs `graphql` present, so
  depending on a transitive peer for it works right up until an intermediate package
  changes its mind.

## Building

```shell
cd client && yarn run build
```

**On Node 17 or newer this fails** with `ERR_OSSL_EVP_UNSUPPORTED`: webpack 4 (via
`@vue/cli-service` 4) asking OpenSSL 3 for an MD4 hash it no longer provides, not a
problem with this code. The versions here are deliberately those the lockfiles pinned, so
pass the flag instead:

```shell
NODE_OPTIONS=--openssl-legacy-provider yarn run build
```

## Sibling repos

| Repo | What it is |
| --- | --- |
| [basic-apollo-graphql](https://github.com/alpersonalwebsite/basic-apollo-graphql) | the same idea with plain `fetch` and no client library |
| [apollo-graphql-full](https://github.com/alpersonalwebsite/apollo-graphql-full) | this schema, in memory, server only |
| [basic-apollo-graphql-mongodb](https://github.com/alpersonalwebsite/basic-apollo-graphql-mongodb) | this schema, persisted with `mongoose` |
