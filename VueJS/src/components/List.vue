<template>
  <ul>
    <li v-for="item in items" v-bind:key="item.id">
      <list-item 
      v-bind:item="item" 
      v-on="$listeners" /> <!-- https://stackoverflow.com/a/56172089 -->
    </li>
  </ul>
</template>

<script>
import ListItem from "./ListItem";

export default {
  name: "list",
  components: {
    "list-item": ListItem
  },
  props: ["items"]
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