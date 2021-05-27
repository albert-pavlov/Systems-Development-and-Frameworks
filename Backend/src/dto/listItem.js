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
    constructor(listItem) {
        this.id = listItem.id;
        this.message = listItem.message;
        this.isDone = listItem.isDone;
        this.createdAt = listItem.createdAt;
        this.assignee = listItem.assignee;
    }
}


module.exports = { ListItem, ListItemInfo };