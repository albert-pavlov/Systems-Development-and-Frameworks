<template>
  <div>
    <form v-if="editMode">
      <input type="text" v-model="message" />
      <button @click="editItem">Save</button>
      <button @click="editModeEnd">Cancel</button>
    </form>
    <template v-if="!editMode">
      <p>{{item.id}}. {{item.message}}</p>
      <button @click="editModeStart">Edit</button>
      <button @click="deleteItem">Delete</button>
    </template>
  </div>
</template>

<script>
export default {
  name: "list-item",
  props: {
    item: Object
  },
  data() {
    return {
      message: "",
      editMode: false
    };
  },
  methods: {
    editModeStart() {
      this.message = this.item.message;
      this.editMode = true;
    },
    editModeEnd() {
      this.editMode = false;
    },
    editItem(e) {
      e.preventDefault();
      if (this.message !== "") {
        this.editMode = false;
        this.item.message = this.message;
        this.$emit("edit-item", this.item);
      }
    },
    deleteItem() {
      this.$emit("delete-item", this.item);
    }
  }
};
</script>

<style scoped>
p {
  display: inline;
}
form {
  display: inline-flex;
}
button {
  margin-left: 5px;
}
</style>
