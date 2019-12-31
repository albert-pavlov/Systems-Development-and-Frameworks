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
    <p>Ausgewählter Monat: {{months[selMonth - 1]}}</p>
    <p v-if="(!itemsRetrieved)">Lade Daten...</p>
    <list
      v-if="itemsRetrieved"
      v-bind:itemsIn="items"
      v-bind:dayIn="curDay"
      v-bind:allowEditIn="allowEdit"
      v-on="$listeners"
      @handle-error="handleError"
      @calculate-wage="calculateWage"
    />
    <b>
      <p v-if="itemsRetrieved">Summe: {{totalDuration}}h x {{hourlyWage}}€ = {{totalWage}}€</p>
    </b>
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
        { number: 23, work: "arbeit_2", duration: 2 },
        { number: 29, work: "arbeit_5", duration: 6 },
        { number: 1, work: "arbeit_1", duration: 3 },
        { number: 30, work: "arbeit_3", duration: 7 },
        { number: 31, work: "arbeit_4", duration: 1 }
      ],
      items: [],
      userData: null,
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
      allowEdit: false,
      totalWage: 0,
      hourlyWage: 10,
      totalDuration: 0
    };
  },
  created() {
    const date = new Date();
    this.curYear = date.getFullYear();
    this.selYear = this.curYear;
    this.curMonth = date.getMonth() + 1;
    this.curDay = date.getDate();
    this.loadItems();
  },
  methods: {
    selectMonth(index) {
      this.selMonth = index + 1;
      this.loadItems();
    },
    selectYear() {
      if (this.selYear == this.curYear && this.selMonth > this.curMonth) {
        this.selMonth = this.curMonth;
      }
      this.loadItems();
    },
    handleError(error) {
      this.errorMsg = error;
      this.itemsRetrieved = true;
      this.$emit("handle-error", error, true);
    },
    loadItems() {
      this.errorMsg = "";
      this.itemsRetrieved = false;
      //put this in .then:
      this.allowEdit =
        this.selYear == this.curYear && this.selMonth == this.curMonth;
      const daysInMonth = new Date(this.selYear, this.selMonth, 0).getDate();
      var finalArr = [];
      for (let i = 0; i < daysInMonth; i++) {
        finalArr.push({ number: i + 1, work: null, duration: 0 });
      }
      var queryArr = this.dummy;
      for (let i = 0; i < queryArr.length; i++) {
        if (queryArr[i].number <= daysInMonth) {
          finalArr[queryArr[i].number - 1] = queryArr[i];
        }
      }
      for (let i = finalArr.length - 1; i >= 0; i--) {
        const weekDay = new Date(this.selYear, this.selMonth, i + 1).getDay();
        if (weekDay == 2 || weekDay == 3) {
          finalArr.splice(i, 1);
        }
      }
      this.items = finalArr;
      this.calculateWage();

      //query: getJahr
      return this.$apollo
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
          this.handleError("[Wage Data] " + error);
        });
    },
    calculateWage() {
      this.totalWage = 0;
      this.totalDuration = 0;
      for (let i = 0; i < this.items.length; i++) {
        this.totalDuration += this.items[i].duration;
      }
      this.totalWage = this.totalDuration * this.hourlyWage;
    }
  }
};
</script>

<style>
button {
  margin-right: 5px;
}
</style>