<template>
  <div>
    <form>
      <h1>Login</h1>
      <input v-model="user" type="text" placeholder="User" :disabled="submitted" ref="user" />
      <input v-model="pass" type="password" placeholder="Password" :disabled="submitted" />
      <button
        @click.prevent="submit()"
        :disabled="(user.length <= 0 || pass.length <= 0 || submitted)"
      >Login</button>
      <p style="color: red">{{errorMsg}}</p>
    </form>
  </div>
</template>

<script>
import { Settings } from "../settings.js";

export default {
  name: "login",
  data() {
    return {
      user: "",
      pass: "",
      errorMsg: "",
      submitted: false
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.user.focus();
    });
  },
  methods: {
    submit() {
      this.errorMsg = "";
      this.submitted = true;
      this.$apollo
        .mutate({
          mutation: require("../graphql/login.gql"),
          variables: {
            usr: this.user,
            pwd: this.pass
          }
        })
        .then(result => {
          const data = result.data.login;
          if (data.length >= 3) {
            Settings.setAuthToken(data[0]);
            Settings.setUserId(data[1]);
            Settings.setUserName(data[2]);
            this.$emit("toggle-logged-in");
          } else {
            this.errorMsg = data[0];
            this.submitted = false;
          }
        })
        .catch(error => {
          this.errorMsg = error;
          this.submitted = false;
        });
    }
  }
};
</script>

<style scoped>
input,
button {
  margin-right: 5px;
}
</style>