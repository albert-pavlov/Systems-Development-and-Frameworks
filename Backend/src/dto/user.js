class User {
    constructor(id, name, password) {
        this.id = id;
        this.name = name;
        this.password = password;
    }
}

class UserInfo {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

module.exports = { User, UserInfo };