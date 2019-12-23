<template>
  <div id="app">
    <template v-if="!loggedIn">
      <login @toggle-logged-in="toggleLoggedIn" />
    </template>
    <template v-else>
      <todos />
    </template>
  </div>
</template>

<script>
import { GLOBAL_AUTH_TOKEN } from "./settings.js";
import Login from "./components/Login.vue";
import Todos from "./components/Todos.vue";

export default {
  name: "app",
  components: {
    Login,
    Todos
  },
  data() {
    return {
      loggedIn: localStorage.getItem(GLOBAL_AUTH_TOKEN) != null
    };
  },
  methods: {
    toggleLoggedIn() {
      this.loggedIn = !this.loggedIn;
    }
  }
};
</script>

<style>
/**/
</style>