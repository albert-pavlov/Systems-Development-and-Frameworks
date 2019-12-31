<template>
  <ul>
    <li v-for="(value, key, index) in userData" v-bind:key="index">{{key}}: {{value}}</li>
  </ul>
</template>

<script>
export default {
  name: "profile",
  props: {
    userDataIn: { type: Object }
  },
  data() {
    return {
      userData: this.userDataIn
    };
  }
};
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-top: 5px;
  margin-bottom: 5px;
}
input,
button {
  margin-right: 5px;
}
</style>