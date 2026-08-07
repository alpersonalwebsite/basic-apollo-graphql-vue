const { ApolloServer, gql, UserInputError } = require('apollo-server')

// In memory, on purpose. This repository is about the CLIENT: what vue-apollo does that
// a hand-written fetch does not. See basic-apollo-graphql-mongodb for the persisted
// version of this same schema.
//
// (The committed apollo-server/yarn.lock also pinned mongoose ^5.7.7, so a database was
// clearly the original intent here. It would duplicate the sibling repo and force anyone
// wanting to look at Vue code to run a database first, so it is deliberately left out.)
let users = [
  { id: '1', name: 'Peter', lastName: 'Pan' },
  { id: '2', name: 'Bill', lastName: 'Jukes' },
  { id: '3', name: 'Alf', lastName: 'Mason' },
  { id: '4', name: 'Canary', lastName: 'Robb' }
]

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    lastName: String
  }

  type Query {
    getUsers: [User!]!
    getUser(id: ID!): User
  }

  type Mutation {
    postUser(id: ID!, name: String!, lastName: String): User!
    deleteUser(id: ID!): User!
  }
`

const findUser = (id) => users.find((user) => user.id === id)

const resolvers = {
  Query: {
    getUsers: () => users,
    getUser: (_parent, { id }) => findUser(id) || null
  },
  Mutation: {
    postUser: (_parent, { id, name, lastName }) => {
      if (findUser(id)) {
        throw new UserInputError('A user with that id already exists', { argumentName: 'id' })
      }
      const user = { id, name, lastName: lastName || null }
      users.push(user)
      return user
    },
    deleteUser: (_parent, { id }) => {
      const user = findUser(id)
      if (!user) {
        throw new UserInputError('No user with that id', { argumentName: 'id' })
      }
      users = users.filter((candidate) => candidate.id !== id)
      return user
    }
  }
}

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 9020

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // The Vue dev server runs on another port, so it is another origin. Naming it beats
  // `cors: true`, which allows everything.
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080',
    credentials: false
  },
  playground: !isProduction,
  introspection: !isProduction,
  // Otherwise an error response carries absolute filesystem paths whenever NODE_ENV is
  // not production, and `node src/` sets no NODE_ENV.
  debug: !isProduction
})

server
  .listen(port)
  .then((info) => console.info(`Apollo server running at ${info.url}`))
  .catch((error) => {
    console.error('Apollo server failed to start:', error.message)
    process.exit(1)
  })
