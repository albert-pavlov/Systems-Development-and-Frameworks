export const GLOBAL_AUTH_TOKEN = "global-auth-token";
export const GLOBAL_USER_ID = "global-user-id";
export const GLOBAL_USER_NAME = "global-user-name";

export var Settings = {
  getVar(key) {
    return localStorage.getItem(key);
  },
  setVar(key, value) {
    localStorage.setItem(key, value);
  },
  getAuthToken() {
    return this.getVar(GLOBAL_AUTH_TOKEN);
  },
  setAuthToken(value) {
    this.setVar(GLOBAL_AUTH_TOKEN, value);
  },
  getUserId() {
    return this.getVar(GLOBAL_USER_ID);
  },
  setUserId(value) {
    this.setVar(GLOBAL_USER_ID, value);
  },
  getUserName() {
    return this.getVar(GLOBAL_USER_NAME);
  },
  setUserName(value) {
    this.setVar(GLOBAL_USER_NAME, value);
  }
};
