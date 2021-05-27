<template>
  <div>
    <div class="item">
      <form v-if="editMode">
        <input
          id="input-edit"
          placeholder="Arbeit"
          ref="editWorkMsg"
          type="text"
          v-model="editWorkMsg"
        />
        <input id="input-duration" placeholder="Dauer" type="number" v-model="editDurationMsg" />
        <button
          id="button-save"
          @click.prevent="editItem"
          :disabled="(editWorkMsg.length <= 0)"
        >Speichern</button>
        <button id="button-edit-end" @click="editModeEnd">Abbrechen</button>
      </form>
      <template v-else>
        <p id="item-description">
          Tag: {{item.day}} |
          Arbeit: {{item.work != null && item.work.length > 0 ? item.work : "null"}} |
          Dauer: {{item.duration}}
        </p>
        <template v-if="(allowEdit && day == item.day)">
          <button id="button-edit-start" @click="editModeStart">Editieren</button>
          <button id="button-clear" @click="clearItem">Leeren</button>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "list-item",
  props: {
    item: { type: Object },
    day: { type: Number },
    allowEdit: { type: Boolean }
  },
  data() {
    return {
      editWorkMsg: this.item.work,
      editDurationMsg: this.item.duration,
      editMode: false
    };
  },
  methods: {
    editModeStart() {
      this.editWorkMsg = this.item.work != null ? this.item.work : "";
      this.editDurationMsg = this.item.duration;
      this.editMode = true;
      this.$nextTick(() => {
        this.$refs.editWorkMsg.focus();
      });
    },
    editModeEnd() {
      this.editMode = false;
    },
    editItem() {
      if (this.editWorkMsg.length <= 0) return;
      this.editMode = false;
      this.item.work = this.editWorkMsg;
      this.editDurationMsg = Math.max(0, Math.min(this.editDurationMsg, 8));
      this.item.duration = this.editDurationMsg;
      this.$emit("edit-item", this.item);
    },
    clearItem() {
      this.item.work = "";
      this.item.duration = 0;
      this.$emit("edit-item", this.item);
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
.item {
  margin-top: 5px;
}
#item-description,
input {
  margin-right: 5px;
}
</style>
