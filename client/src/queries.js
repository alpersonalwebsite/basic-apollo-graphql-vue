import gql from 'graphql-tag'

// Queries live in one module rather than inline in components. gql parses the string
// into the AST Apollo actually sends, which is also what lets editors and codegen tools
// understand it.
export const GET_USERS = gql`
  query getUsers {
    getUsers {
      id
      name
      lastName
    }
  }
`

export const POST_USER = gql`
  mutation postUser($id: ID!, $name: String!, $lastName: String) {
    postUser(id: $id, name: $name, lastName: $lastName) {
      id
      name
      lastName
    }
  }
`

export const DELETE_USER = gql`
  mutation deleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`
