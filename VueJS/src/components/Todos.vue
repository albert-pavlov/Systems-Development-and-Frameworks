<template>
  <div>
    <h1>Todos</h1>
    <b>
      <p>
        User Name: {{userName}}
        <br />
        User ID: {{userId}}
      </p>
    </b>
    <list />
  </div>
</template>

<script>
import { GLOBAL_USER_ID, GLOBAL_USER_NAME } from "../settings.js";
import List from "./List.vue";

export default {
  name: "todos",
  components: {
    List
  },
  computed: {
    userId: () => {
      var userId = localStorage.getItem(GLOBAL_USER_ID);
      if (userId != null) return userId;
      else return -1;
    },
    userName: () => {
      var userName = localStorage.getItem(GLOBAL_USER_NAME);
      if (userName != null) {
        return userName;
      }
      return "";
    }
  }
};
</script>

<style>
/**/
</style>