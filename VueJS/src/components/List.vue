<template>
  <ul>
      <list-item 
        v-for="item in itemsCopy" 
        v-bind:key="item.id" 
        v-bind:item="item" 
        @delete-item="deleteItem"
      />
  </ul>
</template>

<script>
import ListItem from "./ListItem.vue";

export default {
  name: "list",
  components: {
    ListItem
  },
  props: {
    items: { 
      type: Array, 
      required: true 
    }, 
  },
  data() {
    return {
      itemsCopy: this.items
    }
  },
  methods: {
    deleteItem(item) {
      this.itemsCopy = this.itemsCopy.filter(i => i.id !== item.id);
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
