<template>
  <div>
    <form>
      <h1>Login</h1>
      <input v-model="user" type="text" placeholder="User" autofocus :disabled="submitted" />
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
import {
  GLOBAL_AUTH_TOKEN,
  GLOBAL_USER_ID,
  GLOBAL_USER_NAME
} from "../settings.js";
import gql from "graphql-tag";

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
  methods: {
    submit() {
      this.errorMsg = "";
      this.submitted = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation login($usr: String!, $pwd: String!) {
              login(usr: $usr, pwd: $pwd)
            }
          `,
          variables: {
            usr: this.user,
            pwd: this.pass
          }
        })
        .then(result => {
          const data = result.data.login;
          if (data[0] != "Wrong username and/or password!") {
            localStorage.setItem(GLOBAL_AUTH_TOKEN, data[0]);
            localStorage.setItem(GLOBAL_USER_ID, data[1]);
            localStorage.setItem(GLOBAL_USER_NAME, data[2]);
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