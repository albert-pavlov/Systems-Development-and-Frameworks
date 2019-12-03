class ListItem {
    constructor(id, message, isDone, createdAt, user) {
        this.id = id;
        this.message = message;
        this.isDone = isDone;
        this.createdAt = createdAt;
        this.assignee = user;
    }
}

class ListItemInfo {
    constructor(id, message, isDone, createdAt, user) {
        this.id = id;
        this.message = message;
        this.isDone = isDone;
        this.createdAt = createdAt;
        this.assignee = user;
    }
}


module.exports = { ListItem, ListItemInfo };