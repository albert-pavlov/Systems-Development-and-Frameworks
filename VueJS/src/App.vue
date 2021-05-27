<template>
  <div id="app">
    <template v-if="!loggedIn">
      <login @toggle-logged-in="toggleLoggedIn" />
    </template>
    <template v-else>
      <home @toggle-logged-in="toggleLoggedIn" />
    </template>
  </div>
</template>

<script>
import { Settings, Key } from "./settings.js";
import Login from "./components/Login.vue";
import Home from "./components/Home.vue";

export default {
  name: "app",
  components: {
    Login,
    Home
  },
  data() {
    return {
      loggedIn: Settings.get(Key.AuthToken) != null
    };
  },
  methods: {
    toggleLoggedIn() {
      this.loggedIn = !this.loggedIn;
      if (!this.loggedIn) {
        Settings.set(Key.AuthToken, null);
      }
    }
  }
};
</script>

<style>
/**/
</style>