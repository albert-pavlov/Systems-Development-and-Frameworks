<template>
  <div>
    <template v-if="userDataRetrieved">
      <h1>Hallo {{userName}} (ID: {{userId}})!</h1>
      <button @click="(showWageCalculator = true)">Lohnrechner</button>
      <button @click="(showWageCalculator = false)">Profil</button>
      <p>Ausgewählter Modus: {{showWageCalculator ? "Lohnrechner" : "Profil"}}</p>
      <div v-show="showWageCalculator">
        <wage-calculator v-on="$listeners" @handle-error="handleError" />
      </div>
      <div v-show="!showWageCalculator">
        <profile v-bind:userDataIn="userData" />
      </div>
    </template>
    <template v-else>
      <p>Lade Daten...</p>
    </template>
    <p style="color: red">{{errorMsg}}</p>
  </div>
</template>

<script>
import { Settings, Key } from "../settings.js";
import WageCalculator from "./WageCalculator.vue";
import Profile from "./Profile.vue";

export default {
  name: "home",
  components: {
    WageCalculator,
    Profile
  },
  data() {
    return {
      showWageCalculator: true,
      userData: {
        //dummy
        id: 1,
        firstname: "Test",
        lastname: "User"
      },
      userId: Settings.get(Key.UserId),
      userName: "Testuser", //change later to first/last-name
      userDataRetrieved: false,
      errorMsg: ""
    };
  },
  created() {
    this.loadUserData();
  },
  methods: {
    handleError(error, handled) {
      if (handled != undefined && !handled) this.errorMsg = error;
      this.userDataRetrieved = true;
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
    loadUserData() {
      //query: getprofile -> fill this.userData
      this.errorMsg = "";
      this.userDataRetrieved = false;
      return this.$apollo
        .query({
          query: require("../graphql/getAssignedListItems.gql"),
          variables: {
            assigneeID: this.userId
          }
        })
        .then(result => {
          //change this.userData
          this.items = result.data.getAssignedListItems;
          this.userDataRetrieved = true;
        })
        .catch(error => {
          this.handleError("[User Data] " + error, false);
        });
    }
  }
};
</script>

<style>
/**/
</style>