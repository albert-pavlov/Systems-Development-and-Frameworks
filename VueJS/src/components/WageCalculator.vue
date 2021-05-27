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
      v-bind:itemsIn="monthItems"
      v-bind:dayIn="curDay"
      v-bind:allowEditIn="allowEdit"
      v-on="$listeners"
      @handle-error="handleError"
      @calculate-wage="calculateWage"
      @update-year="loadYearItems"
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
      yearItems: [],
      monthItems: [],
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
      selMonth: 1,
      curDay: 1,
      userId: Settings.get(Key.UserId),
      userName: Settings.get(Key.UserName),
      itemsRetrieved: false,
      errorMsg: "",
      allowEdit: false,
      totalWage: 0,
      hourlyWage: Settings.get(Key.UserWage),
      totalDuration: 0
    };
  },
  created() {
    const date = new Date();
    this.curYear = date.getFullYear();
    this.selYear = this.curYear;
    this.curMonth = date.getMonth() + 1;
    this.selMonth = this.curMonth;
    this.curDay = date.getDate();
    this.loadYearItems();
  },
  methods: {
    selectMonth(index) {
      this.selMonth = index + 1;
      this.loadMonthItems();
    },
    selectYear() {
      if (this.selYear == this.curYear && this.selMonth > this.curMonth) {
        this.selMonth = this.curMonth;
      }
      this.loadYearItems();
    },
    handleError(error) {
      this.errorMsg = error;
      this.itemsRetrieved = true;
      this.$emit("handle-error", error, true);
    },
    loadYearItems() {
      this.errorMsg = "";
      this.itemsRetrieved = false;
      return this.$apollo
        .query({
          query: require("../graphql/getJahr.gql"),
          variables: {
            number: Number(this.selYear),
            userId: this.userId
          }
        })
        .then(result => {
          this.yearItems = result.data.getJahr;
          this.loadMonthItems();
        })
        .catch(error => {
          this.handleError("[Wage Data] " + error);
        });
    },
    loadMonthItems() {
      this.allowEdit =
        this.selYear == this.curYear && this.selMonth == this.curMonth;
      const daysInMonth = new Date(this.selYear, this.selMonth, 0).getDate();
      var finalArr = [];
      for (let i = 0; i < daysInMonth; i++) {
        finalArr.push({ day: i + 1, work: null, duration: 0 });
      }
      var queryArr = [];
      var targetMonth = this.yearItems.months[this.selMonth - 1];
      if (targetMonth != null) {
        queryArr = targetMonth.days;
      }
      for (let i = 0; i < queryArr.length; i++) {
        if (queryArr[i] != null) {
          if (queryArr[i].day <= daysInMonth) {
            finalArr[queryArr[i].day - 1] = queryArr[i];
          }
        }
      }
      for (let i = finalArr.length - 1; i >= 0; i--) {
        const weekDay = new Date(
          this.selYear,
          this.selMonth - 1,
          i + 1
        ).getDay();
        if (weekDay == 0 || weekDay == 6) {
          finalArr.splice(i, 1);
        }
      }
      this.monthItems = finalArr;
      this.calculateWage();
      this.itemsRetrieved = false;
      this.$nextTick(() => {
        this.itemsRetrieved = true;
      });
    },
    calculateWage() {
      this.totalWage = 0;
      this.totalDuration = 0;
      for (let i = 0; i < this.monthItems.length; i++) {
        this.totalDuration += this.monthItems[i].duration;
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