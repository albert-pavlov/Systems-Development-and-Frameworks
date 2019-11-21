const listItems = require('./database');
const utils = require('./utils');
const ListItem = require("./listItem");


const resolvers = {
    Query: {        
        getAllListItems: async function(parent, args, context, info) {
            let tempListItems = JSON.parse(JSON.stringify(listItems));

            if(utils.ORDERBY.asc === args.orderBy || utils.ORDERBY.desc === args.orderBy) {
                tempListItems = utils.sortListItemsByOrder(tempListItems, args.orderBy);
            }
            const allListItems = tempListItems;            
            const allDoneListItems =
                (args.isDone == true || args.isDone == false) ?
                    allListItems.filter(listItem => listItem.isDone == args.isDone)
                    : allListItems;
            
            return allDoneListItems;
        }        
    },
    Mutation: {        
        createListItem: async function(parent, args, context, info) {
            if(args.message != "" && args.message != null && args.message != undefined) {
                let listItem = new ListItem(utils.generateRandomId(listItems), args.message, false, ((new Date).getTime()).toString());
                listItems.push(listItem);

                return listItem;
            }
            return;
        },
        finishListItem: async function(parent, args, context, info) {
            if(typeof(args.id) === 'number' && args.id != null && args.id != undefined) {
                let listItem;
                for(i = 0; i < listItems.length; i++) {
                    if(listItems[i].id === args.id) {
                        listItems[i].isDone = true;
                        listItem = listItems[i];
                    }
                }
                return listItem != null ?listItem : null;
            }
            return;
        },
        deleteListItem: async function(parent, args, context, info) {
            if(typeof(args.id) === 'number' && args.id != null && args.id != undefined) {
                let listItem;
                for(i = 0; i < listItems.length; i++) {
                    if(listItems[i].id === args.id) {
                        listItem = listItems[i];                        
                        listItems.splice(i, 1);
                    }
                }
                return listItem != null ? listItem : null;
            }
            return;
        }        
    },
    ListItem: {
        createdAt: (parent, args, context, info) => {
            return new Date(Number(parent.createdAt)).toISOString();
        }
    }
};

module.exports = resolvers;