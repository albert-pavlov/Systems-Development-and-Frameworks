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
    <list v-on="$listeners" />
  </div>
</template>

<script>
import { Settings, Key } from "../settings.js";
import List from "./List.vue";

export default {
  name: "todos",
  components: {
    List
  },
  data() {
    return {
      userId: Settings.get(Key.UserId),
      userName: Settings.get(Key.UserName)
    };
  }
};
</script>

<style>
/**/
</style>