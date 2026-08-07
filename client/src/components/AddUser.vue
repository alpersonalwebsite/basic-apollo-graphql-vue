<template>
  <form @submit.prevent="submit">
    <h2>Add a user</h2>
    <label for="id">id</label>
    <input id="id" v-model="id" required>
    <label for="name">name</label>
    <input id="name" v-model="name" required>
    <label for="lastName">last name</label>
    <input id="lastName" v-model="lastName">
    <button :disabled="saving">{{ saving ? 'saving...' : 'add' }}</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script>
import { GET_USERS, POST_USER } from '../queries'

export default {
  name: 'AddUser',

  data() {
    return { id: '', name: '', lastName: '', saving: false, error: null }
  },

  methods: {
    async submit() {
      this.saving = true
      this.error = null

      try {
        await this.$apollo.mutate({
          mutation: POST_USER,
          variables: {
            id: this.id.trim(),
            name: this.name.trim(),
            // null rather than '': the schema's lastName is nullable, and an empty
            // string is a different thing from an absent value.
            lastName: this.lastName.trim() || null
          },
          refetchQueries: [{ query: GET_USERS }]
        })

        this.id = ''
        this.name = ''
        this.lastName = ''
      } catch (err) {
        // The server raises UserInputError for a duplicate id, and this is where that
        // arrives. A bare Error there would have reached the client as
        // INTERNAL_SERVER_ERROR, which reads like "retry later" instead of "use another
        // id".
        this.error = err.message
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.error {
  color: #b00020;
}
form {
  margin-bottom: 1.5rem;
}
label {
  margin-right: 0.25rem;
}
input {
  margin-right: 0.75rem;
}
</style>
