const ListItem = require("./listItem");

const ORDERBY = {
    ASC: 'asc',
    DESC: 'desc'
}
module.exports = ORDERBY;
module.exports = { 
    epochToLocaleDateTimeArr: function(arr) {
        var newArr = JSON.parse(JSON.stringify(arr));
        for (i = 0; i < arr.length; i++) {
            newArr[i].createdAt = new Date(Number(arr[i].createdAt)).toLocaleString("en-GB");
        }
        return newArr;
    },
    epochToLocaleDateTime: function(elem) {
        let listItem = new ListItem(elem.id, elem.message, elem.isDone, elem.createdAt);
        listItem.createdAt = new Date(Number(listItem.createdAt)).toLocaleString("en-GB");
        
        return listItem;
    },
    generateRandomId: function (arr) {
        let largestId = 0;

        for(i = 0; i < arr.length; i++) {
            if(arr[i].id > largestId) {
                largestId = arr[i].id;
            }
        }
        largestId += Math.floor(Math.random() * arr.length);
        
        return largestId; 
    }
};