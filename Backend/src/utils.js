const ORDERBY = {
    ASC: 'asc',
    DESC: 'desc'
}
module.exports = ORDERBY;
module.exports = { 
    epochToLocaleDateTime: function(arr) {
        var newArr = JSON.parse(JSON.stringify(arr));
        for (i = 0; i < arr.length; i++) {
            newArr[i].createdAt = new Date(Number(arr[i].createdAt)).toLocaleString("en-GB");
        }
        return newArr;
    }
};