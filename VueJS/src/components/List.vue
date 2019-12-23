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
import { Settings } from "../settings.js";
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
      itemsRetrieved: false,
      userId: Settings.getUserId()
    };
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
    handleError(error) {
      this.errorMsg = error;
      this.itemsRetrieved = true;
      var noAuthStr = "Not Authorised!";
      if (String(error).match(noAuthStr + "$") == noAuthStr) {
        Settings.setAuthToken(null);
        this.errorMsg +=
          " Logged out from the session. You will be redirected to the login page in a few seconds.";
        setTimeout(() => {
          this.$emit("toggle-logged-in");
        }, 5000);
      }
    },
    loadItems() {
      this.errorMsg = "";
      this.$apollo
        .query({
          query: require("../graphql/loadItems.gql"),
          variables: {
            assigneeID: this.userId
          }
        })
        .then(result => {
          this.items = result.data.getAssignedListItems;
          this.itemsRetrieved = true;
        })
        .catch(error => {
          this.handleError(error);
        });
    },
    addItem() {
      if (this.addTodoMsg.length <= 0) return;
      //db
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: require("../graphql/createListItem.gql"),
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
          this.handleError(error);
        });
    },
    doneItem(item) {
      //db
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: require("../graphql/finishListItem.gql"),
          variables: {
            id: item.id
          }
        })
        .catch(error => {
          this.handleError(error);
        });
    },
    editItem(item) {
      //db
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: require("../graphql/updateListItem.gql"),
          variables: {
            id: item.id,
            userId: this.userId,
            message: item.message
          }
        })
        .catch(error => {
          this.handleError(error);
        });
    },
    deleteItem(item) {
      //ui
      this.items = this.items.filter(i => i.id !== item.id);
      //db
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: require("../graphql/deleteListItem.gql"),
          variables: {
            id: item.id
          }
        })
        .catch(error => {
          this.handleError(error);
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
