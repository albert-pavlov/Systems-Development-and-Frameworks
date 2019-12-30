<template>
  <div>
    <h1>Hallo {{userName}} (ID: {{userId}})!</h1>
    <button @click="(showWageCalculator = true)">Lohnrechner</button>
    <button @click="(showWageCalculator = false)">Profil</button>
    <p>Ausgewählter Modus: {{showWageCalculator ? "Lohnrechner" : "Profil"}}</p>
    <div v-show="showWageCalculator">
      <wage-calculator v-on="$listeners" />
    </div>
  </div>
</template>

<script>
import { Settings, Key } from "../settings.js";
import WageCalculator from "./WageCalculator.vue";

export default {
  name: "home",
  components: {
    WageCalculator
  },
  data() {
    return {
      showWageCalculator: true,
      userId: Settings.get(Key.UserId),
      userName: Settings.get(Key.UserName)
    };
  }
};
</script>

<style>
/**/
</style>