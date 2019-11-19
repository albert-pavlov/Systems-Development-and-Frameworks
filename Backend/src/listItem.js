class ListItem {
    constructor(id, message, isDone, createdAt) {
        this.id = id;
        this.message = message;
        this.isDone = isDone;
        this.createdAt = createdAt;
    }
}

module.exports = ListItem;