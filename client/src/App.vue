<template>
  <div id="app">
    <h1>Vue + Apollo GraphQL</h1>
    <AddUser />
    <UserList />
  </div>
</template>

<script>
import AddUser from './components/AddUser.vue'
import UserList from './components/UserList.vue'

export default {
  name: 'App',
  components: { AddUser, UserList }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  margin: 40px;
}
</style>
