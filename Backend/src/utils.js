module.exports = {
    generateRandomId: function (arr) {
        let largestId = 0;

        for (i = 0; i < arr.length; i++) {
            if (arr[i].id > largestId) {
                largestId = arr[i].id;
            }
        }
        largestId += Math.floor(Math.random() * arr.length+1);

        return largestId;
    },
    sortListItemsByOrder: function (arr, orderBy) {
        let newArr = JSON.parse(JSON.stringify(arr));

        if (orderBy == this.ORDERBY.asc) {
            newArr.sort((a, b) => {
                return Number(a.createdAt) - Number(b.createdAt);
            });
            return newArr;
        }

        if (orderBy == this.ORDERBY.desc) {
            newArr.sort((a, b) => {
                return Number(b.createdAt) - Number(a.createdAt);
            });
            return newArr;
        }
    },
    ORDERBY: {
        asc: 'asc',
        desc: 'desc'
    }
};