<template>
  <div>
    <form>
      <input type="text" v-model="addTodoMsg" ref="addTodoMsg" placeholder="New Todo" />
      <button @click.prevent="addItem()">Add</button>
    </form>
    <ul v-if="(itemsRetrieved && items.length > 0)">
      <list-item
        v-for="item in items"
        v-bind:key="item.id"
        v-bind:item="item"
        @done-item="doneItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
      />
    </ul>
    <p v-if="(itemsRetrieved && items.length <= 0)">Todo list is empty.</p>
    <p v-if="(!itemsRetrieved)">Loading todos...</p>
    <p style="color: red">{{errorMsg}}</p>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { GLOBAL_USER_ID } from "../settings.js";
import ListItem from "./ListItem.vue";

export default {
  name: "list",
  components: {
    ListItem
  },
  data() {
    return {
      items: [],
      addTodoMsg: "",
      errorMsg: "",
      itemsRetrieved: false
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
  mounted() {
    this.$nextTick(() => {
      this.$refs.addTodoMsg.focus();
    });
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
          this.itemsRetrieved = true;
        })
        .catch(error => {
          this.errorMsg = error;
        });
    },
    addItem() {
      if (this.addTodoMsg.length <= 0) return;
      //db
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
          //ui
          this.items.push(item);
          this.addTodoMsg = "";
        })
        .catch(error => {
          this.errorMsg = error;
        });
    },
    doneItem(item) {
      //db
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: gql`
            mutation finishListItem($id: ID!) {
              finishListItem(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: item.id
          }
        })
        .catch(error => {
          this.errorMsg = error;
        });
    },
    editItem(item) {
      //db
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: gql`
            mutation updateListItem($id: ID!, $userId: ID!, $message: String!) {
              updateListItem(id: $id, userId: $userId, message: $message) {
                id
                message
              }
            }
          `,
          variables: {
            id: item.id,
            userId: this.userId,
            message: item.message
          }
        })
        .catch(error => {
          this.errorMsg = error;
        });
    },
    deleteItem(item) {
      //db
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: gql`
            mutation deleteListItem($id: ID!) {
              deleteListItem(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: item.id
          }
        })
        .then(() => {
          //ui
          this.items = this.items.filter(i => i.id !== item.id);
        })
        .catch(error => {
          this.errorMsg = error;
        });
    }
  }
};
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-top: 5px;
  margin-bottom: 5px;
}
button {
  margin-left: 5px;
}
</style>
