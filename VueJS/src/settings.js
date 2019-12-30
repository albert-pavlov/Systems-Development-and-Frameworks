export const Key = Object.freeze({
  AuthToken: "global-auth-token",
  UserId: "global-user-id",
  UserName: "global-user-name"
});

export var Settings = {
  rem(key) {
    return localStorage.removeItem(key);
  },
  get(key) {
    return localStorage.getItem(key);
  },
  set(key, value) {
    if (value != null) {
      localStorage.setItem(key, value);
    } else {
      this.rem(key);
    }
  }
};