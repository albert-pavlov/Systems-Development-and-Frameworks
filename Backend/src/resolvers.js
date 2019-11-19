const listItems = require('./database');
const utils = require('./utils');
const ListItem = require("./listItem");


const resolvers = {
    Query: {        
        getAllListItems: async function(parent, args, context, info) {
            const allListItems = utils.epochToLocaleDateTimeArr(listItems);
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

                return utils.epochToLocaleDateTime(listItem);
            }
            return null;
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
                return listItem != null ? utils.epochToLocaleDateTime(listItem) : null;
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
                return listItem != null ? utils.epochToLocaleDateTime(listItem) : null;
            }
            return;
        }        
    }
};

module.exports = resolvers;