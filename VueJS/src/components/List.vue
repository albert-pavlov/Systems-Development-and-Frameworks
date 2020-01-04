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
      this.$emit("update-year");
      this.$emit("calculate-wage");
      this.errorMsg = "";
      this.$apollo
        .mutate({
          mutation: require("../graphql/setWorkAndDuration.gql"),
          variables: {
            work: item.work,
            duration: Number(item.duration),
            userId: this.userId
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