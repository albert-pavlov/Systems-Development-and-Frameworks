<template>
  <div>
    <div class="item">
      <form v-if="editMode">
        <input id="input-edit" ref="editTodoMsg" type="text" v-model="editTodoMsg" />
        <button
          id="button-save"
          @click.prevent="editItem"
          :disabled="(editTodoMsg.length <= 0)"
        >Save</button>
        <button id="button-edit-end" @click="editModeEnd">Cancel</button>
      </form>
      <template v-else>
        <p
          id="item-description"
        >Todo | id: {{item.id}} | message: {{item.message}} | isDone: {{item.isDone}} | createdAt: {{item.createdAt}}</p>
        <button id="button-done" @click="doneItem" :disabled="item.isDone">Done</button>
        <button id="button-edit-start" @click="editModeStart">Edit</button>
        <button id="button-delete" @click="deleteItem">Delete</button>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "list-item",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editTodoMsg: this.item.message,
      editMode: false
    };
  },
  methods: {
    doneItem() {
      this.item.isDone = true;
      this.$emit("editTodoMsg", this.item);
    },
    editModeStart() {
      this.editMode = true;
      this.$nextTick(() => {
        this.$refs.editTodoMsg.focus();
      });
    },
    editModeEnd() {
      this.editMode = false;
    },
    editItem() {
      if (this.editTodoMsg.length <= 0) return;
      this.editMode = false;
      this.item.message = this.editTodoMsg;
      this.$emit("edit-item", this.item);
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
.item {
  margin-top: 5px;
}
</style>
