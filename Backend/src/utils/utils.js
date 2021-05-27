module.exports = {
    generateRandomId: function (id) {
        return  (id + Math.floor(Math.random() * 10) + 1);
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