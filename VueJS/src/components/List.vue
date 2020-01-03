<template>
  <div>
    <ul>
      <list-item
        v-for="(item, index) in items"
        v-bind:key="index"
        v-bind:item="item"
        v-bind:day="dayIn"
        v-bind:allowEdit="allowEditIn"
        @edit-item="editItem"
        @clear-item="clearItem"
      />
    </ul>
  </div>
</template>

<script>
import { Settings, Key } from "../settings.js";
import ListItem from "./ListItem.vue";

export default {
  name: "list",
  components: {
    ListItem
  },
  props: {
    itemsIn: { type: Array },
    dayIn: { type: Number },
    allowEditIn: { type: Boolean }
  },
  data() {
    return {
      items: this.itemsIn,
      userId: Settings.get(Key.UserId)
    };
  },
  methods: {
    handleError(error) {
      this.$emit("handle-error", "[Wage Item Data] " + error);
    },
    editItem(item) {
      this.$emit("calculate-wage");
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
    clearItem(item) {
      this.$emit("calculate-wage");
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
