<template>
  <div id="app">
    <template v-if="!loggedIn">
      <login @toggle-logged-in="toggleLoggedIn" />
    </template>
    <template v-else>
      <todos @toggle-logged-in="toggleLoggedIn" />
    </template>
  </div>
</template>

<script>
import { Settings, Key } from "./settings.js";
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
      loggedIn: Settings.get(Key.AuthToken) != null
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