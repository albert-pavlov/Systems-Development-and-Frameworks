<template>
  <div id="app">
    <template v-if="!loggedIn">
      <login @toggle-logged-in="toggleLoggedIn" />
    </template>
    <template v-else>
      <h2>Todos</h2>
      <h3>
        User Name: {{userName}}
        <br />
        User ID: {{userId}}
      </h3>
      <list />
    </template>
  </div>
</template>

<script>
import List from "./components/List.vue";
import Login from "./components/Login.vue";
import {
  GLOBAL_AUTH_TOKEN,
  GLOBAL_USER_ID,
  GLOBAL_USER_NAME
} from "./settings.js";

export default {
  name: "app",
  components: {
    List,
    Login
  },
  data() {
    return {
      loggedIn: localStorage.getItem(GLOBAL_AUTH_TOKEN) != null
    };
  },
  computed: {
    userId: function() {
      var userId = localStorage.getItem(GLOBAL_USER_ID);
      if (userId != null) return userId;
      else return -1;
    },
    userName: function() {
      var userName = localStorage.getItem(GLOBAL_USER_NAME);
      if (userName != null) {
        return userName;
      }
      return "";
    }
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