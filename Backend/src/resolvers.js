const listItems = require('./database');
const utils = require('./utils');


const resolvers = {
    Query: {        
        getAllListItems: async function(parent, args, context, info) {
            const allListItems = utils.epochToLocaleDateTime(listItems);
            const allDoneListItems =
                (args.isDone == true || args.isDone == false) ?
                    allListItems.filter(listItem => listItem.isDone == args.isDone)
                    : allListItems;

            return allDoneListItems;
        }        
    }
};

module.exports = resolvers;