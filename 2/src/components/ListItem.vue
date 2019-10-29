<template>
  <div>
    <form v-if="editMode">
      <input id="input-edit" type="text" v-model="message" />
      <button id="button-save" @click="editItem">Save</button>
      <button id="button-edit-end" @click="editModeEnd">Cancel</button>
    </form>
    <template v-else>
      <p id="item-description">{{item.id}}. {{item.message}}</p>
      <button id="button-edit-start" @click="editModeStart">Edit</button>
      <button id="button-delete" @click="deleteItem">Delete</button>
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
