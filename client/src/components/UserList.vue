<template>
  <div>
    <h2>Users</h2>

    <!--
      $apollo.loading and the `error` below are what vue-apollo gives you for free. The
      hand-written fetch in basic-apollo-graphql needed a loading flag, an error field
      and a try/catch to arrive at the same three states.
    -->
    <p v-if="$apollo.queries.getUsers.loading">Loading...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="!getUsers.length">No users.</p>
    <ul v-else>
      <li v-for="user in getUsers" :key="user.id">
        {{ user.name }} {{ user.lastName }}
        <button :disabled="removing === user.id" @click="remove(user.id)">
          {{ removing === user.id ? 'removing...' : 'delete' }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { GET_USERS, DELETE_USER } from '../queries'

export default {
  name: 'UserList',

  data() {
    return {
      // Not `null`: the template iterates it before the query resolves, and vue-apollo
      // leaves the property alone until then.
      getUsers: [],
      error: null,
      removing: null
    }
  },

  // The whole fetch, declared rather than written. vue-apollo runs it, keeps it in the
  // cache, and assigns the result onto `this.getUsers` by matching the property name.
  apollo: {
    getUsers: {
      query: GET_USERS,
      // Without this, a GraphQL error is thrown at the component and shows up as an
      // unhandled rejection rather than as something the template can render.
      error(err) {
        this.error = err.message
      }
    }
  },

  methods: {
    async remove(id) {
      this.removing = id
      this.error = null

      try {
        await this.$apollo.mutate({
          mutation: DELETE_USER,
          variables: { id },
          // The cache does not know a mutation invalidated the list, so it has to be
          // told. Refetching is the blunt option and the honest one for a demo; the
          // alternative is writing the new list into the cache by hand with `update`,
          // which is faster and much easier to get subtly wrong.
          refetchQueries: [{ query: GET_USERS }]
        })
      } catch (err) {
        this.error = err.message
      } finally {
        this.removing = null
      }
    }
  }
}
</script>

<style scoped>
.error {
  color: #b00020;
}
</style>
