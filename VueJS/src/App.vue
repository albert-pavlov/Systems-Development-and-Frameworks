<template>
  <div id="app">
    Hello Vue.js!
    <list v-bind:items="todos" />
  </div>
</template>

<script>
import List from "./components/List.vue";

export default {
  name: "app",
  components: { 
    List
  },
  data() {
    return {
      todos: [
        { id: "1", message: "Foo" },
        { id: "2", message: "Bar" },
        { id: "3", message: "Baz" }
      ]
    };
  }
};
</script>

<style>
/**/
</style>