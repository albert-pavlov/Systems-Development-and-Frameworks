<template>
  <div>
    <form>
      <input id="input-edit" type="text" v-model="addTodoMsg" />
      <button @click.prevent="addItem()">Add</button>
    </form>
    <template v-if="(items.length > 0)">
      <ul>
        <list-item
          v-for="item in items"
          v-bind:key="item.id"
          v-bind:item="item"
          @done-item="doneItem"
          @edit-item="editItem"
          @delete-item="deleteItem"
        />
      </ul>
    </template>
    <template v-else>Todo list empty.</template>
    <p style="color: red" v-if="(errorMsg.length > 0)">{{errorMsg}}</p>
  </div>
</template>

<script>
import ListItem from "./ListItem.vue";
import gql from "graphql-tag";
import { GLOBAL_USER_ID } from "../settings.js";

export default {
  name: "list",
  components: {
    ListItem
  },
  data() {
    return {
      items: [],
      addTodoMsg: "",
      errorMsg: ""
    };
  },
  computed: {
    userId: function() {
      var userId = localStorage.getItem(GLOBAL_USER_ID);
      if (userId != null) return userId;
      else return -1;
    }
  },
  beforeMount() {
    this.loadItems();
  },
  methods: {
    loadItems() {
      this.errorMsg = "";
      this.$apollo
        .query({
          query: gql`
            query getAssignedListItems($assigneeID: ID!) {
              getAssignedListItems(assigneeID: $assigneeID) {
                id
                message
                isDone
                createdAt
              }
            }
          `,
          variables: {
            assigneeID: this.userId
          }
        })
        .then(result => {
          this.items = result.data.getAssignedListItems;
        })
        .catch(error => {
          this.errorMsg = error;
        });
    },
    addItem() {
      if (this.addTodoMsg.length <= 0) return;
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: gql`
            mutation createListItem($message: String!, $assigneeID: ID) {
              createListItem(message: $message, assigneeID: $assigneeID) {
                id
                message
                isDone
                createdAt
              }
            }
          `,
          variables: {
            message: this.addTodoMsg,
            assigneeID: this.userId
          }
        })
        .then(result => {
          const item = result.data.createListItem;
          this.items.push({
            id: item.id,
            message: item.message,
            isDone: item.isDone,
            createdAt: item.createdAt
          });
        })
        .catch(error => {
          this.errorMsg = error;
        });
      this.addTodoMsg = "";
    },
    doneItem(item) {
      //
      alert(item.isDone);
    },
    editItem(item) {
      //
      alert(item.message);
    },
    deleteItem(item) {
      alert(item.id);
      this.items = this.items.filter(i => i.id !== item.id);
    }
  }
};
</script>

<style scoped>
ul {
  list-style: circle;
}
li {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
