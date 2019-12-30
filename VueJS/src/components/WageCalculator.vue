<template>
  <div>
    Jahr:
    <select v-model="selYear" @change="selectYear()">
      <option>{{curYear - 1}}</option>
      <option>{{curYear}}</option>
    </select>
    <p>Ausgewähltes Jahr: {{selYear}}</p>
    <p />Monat:
    <button
      v-for="(month, index) in months"
      v-bind:key="index"
      @click="selectMonth(index)"
      :disabled="(selYear == curYear && (index + 1) > curMonth)"
    >{{month}}</button>
    <p>Ausgewählter Monat: {{selMonth}}</p>
    <list
      v-if="itemsRetrieved"
      v-bind:itemsIn="loadItems()"
      v-bind:dayIn="curDay"
      v-bind:allowEditIn="allowEdit"
      v-on="$listeners"
      @handle-error="handleError"
    />
    <p v-if="(!itemsRetrieved)">Lade Daten...</p>
    <p style="color: red">{{errorMsg}}</p>
  </div>
</template>

<script>
import { Settings, Key } from "../settings.js";
import List from "./List.vue";

export default {
  name: "wage-calculator",
  components: {
    List
  },
  data() {
    return {
      dummy: [
        { number: 23, work: "arbeit_2", duration: 1 },
        { number: 1, work: "arbeit_1", duration: 3 },
        { number: 30, work: "arbeit_3", duration: 7 },
        { number: 31, work: "arbeit_4", duration: 10 }
      ],
      months: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
      ],
      curYear: 2000,
      selYear: 2000,
      curMonth: 1,
      selMonth: 12,
      curDay: 1,
      userId: Settings.get(Key.UserId),
      userName: Settings.get(Key.UserName),
      itemsRetrieved: false,
      errorMsg: "",
      allowEdit: false
    };
  },
  created() {
    const date = new Date();
    this.curYear = date.getFullYear();
    this.selYear = this.curYear;
    this.curMonth = date.getMonth() + 1;
    this.curDay = date.getDate();
  },
  methods: {
    selectMonth(index) {
      this.selMonth = index + 1;
      this.loadItems();
    },
    selectYear() {
      this.loadItems();
    },
    handleError(error) {
      this.errorMsg = error;
      this.itemsRetrieved = true;
      var noAuthStr = "Not Authorised!";
      if (String(error).match(noAuthStr + "$") == noAuthStr) {
        Settings.set(Key.AuthToken, null);
        this.errorMsg +=
          " Logged out from the session. You will be redirected to the login page in a few seconds.";
        setTimeout(() => {
          this.$emit("toggle-logged-in");
        }, 5000);
      }
    },
    loadItems() {
      this.errorMsg = "";
      this.itemsRetrieved = false;
      //put this in .then:
      this.allowEdit =
        this.selYear == this.curYear && this.selMonth == this.curMonth;
      const daysInMonth = new Date(this.selYear, this.selMonth, 0).getDate();
      var arr = [];
      for (let i = 0; i < daysInMonth; i++) {
        arr.push({ number: i + 1, work: null, duration: 0 });
      }
      var res = this.dummy;
      for (let i = 0; i < res.length; i++) {
        arr[i.number - 1] = res[i];
      }
      this.items = res;
      this.$apollo
        .query({
          query: require("../graphql/getAssignedListItems.gql"),
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
    }
  }
};
</script>

<style>
button {
  margin-right: 5px;
}
</style>