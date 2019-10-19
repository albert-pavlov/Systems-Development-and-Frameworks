<template>
  <div id="app">
    Hello Vue.js!
    <list 
    v-bind:items="todos" 
    v-on:edit-item="editItem" 
    v-on:delete-item="deleteItem" />
  </div>
</template>

<script>
import List from "./components/List";

export default {
  name: "app",
  components: { 
    "list": List
  },
  data() {
    return {
      todos: [
        { id: "1", message: "Foo" },
        { id: "2", message: "Bar" },
        { id: "3", message: "Baz" }
      ]
    };
  },
  methods: {
    editItem(id, message) {
      this.todos.find(todo => todo.id === id).message = message;
    editItem(id, editedTodo) {
      this.todos = this.todos.map(todo => todo.id === editedTodo ? editedTodo : todo);
    },
    deleteItem(id) {
      this.todos = this.todos.filter(todo => todo.id !== id);
    }
  }
};
</script>

<style>
/**/
</style>
