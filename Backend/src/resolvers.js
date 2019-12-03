const db = require('./database');
const utils = require('./utils');
const { ListItem, ListItemInfo } = require("./listItem");
const { User, UserInfo } = require('./user');
const jwtService = require('./jwt/service');


const resolvers = {
    Query: {        
        getAllListItems: async function(parent, args, context, info) {
            let tempListItems = JSON.parse(JSON.stringify(db.listItems));

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
        login: async function(parent, args, context, info) {
            if(args.usr != "" && args.usr != null && args.usr != undefined && args.pwd != "" && args.pwd != null && args.pwd != undefined) {
                let loggedInUser 
                db.users.forEach(usr => {
                    if(usr.name == args.usr && usr.password == args.pwd) {
                        loggedInUser = usr;
                    }
                }) 
                let sOptions = {
                    issuer: "Authorization",
                    subject: loggedInUser != undefined ? loggedInUser.name : null, 
                    audience: "HTW Alumni"
                   }

                return loggedInUser != undefined ? jwtService.sign({}, sOptions) : "Wrong username and/or password!";
            }
        },
        createListItem: async function(parent, args, context, info) {
            if(args.message != "" && args.message != null && args.message != undefined) {
                let listItem = new ListItem(utils.generateRandomId(db.listItems), args.message, false, 
                                        ((new Date).getTime()).toString(), db.users.find(usr => { return usr.id == args.assigneeID }));
                db.listItems.push(listItem);

                return listItem;
            }
            return;
        },
        assignListItem: async function(parent, args, context, info) {
        
            let listItem = db.listItems.find(listItem => { return listItem.id == args.id});
            if(listItem != null) {
                listItem.assignee = db.users.find(usr => { return usr.id == args.assigneeID });
               
                return listItem;
            }
        },
        finishListItem: async function(parent, args, context, info) {
                let listItemInfo;
                for(i = 0; i < db.listItems.length; i++) {
                    if(db.listItems[i].id == args.id) {
                        db.listItems[i].isDone = true;
                        listItem = db.listItems[i];
                        listItemInfo = new ListItemInfo(listItem.id, listItem.message, listItem.isDone, listItem.createdAt, listItem.assignee);              
                    }
                }
                return listItemInfo;
        },
        deleteListItem: async function(parent, args, context, info) {           
            let listItemInfo;
            for(i = 0; i < db.listItems.length; i++) {
                if(db.listItems[i].id == args.id) {
                    listItem = db.listItems[i];  
                    listItemInfo = new ListItemInfo(listItem.id, listItem.message, listItem.isDone, listItem.createdAt, listItem.assignee);                      
                    db.listItems.splice(i, 1);
                }
            }
            return listItemInfo;
            
        },
        createUser: async function(parent, args, context, info) {
            if(args.name != "" && args.name != null && args.name != undefined && args.pwd != "" && args.pwd != null && args.pwd != undefined) {
                let user = db.users.find((user) => user.name === args.name); 
                if(user == null) {
                    user = new User(utils.generateRandomId(db.users), args.name, args.pwd);
                    db.users.push(user);

                    return new UserInfo(user.id, user.name);
                }
            }
            return;
        }        
    },
    ListItem: {
        createdAt: (parent, args, context, info) => {
            return new Date(Number(parent.createdAt)).toISOString();
        }
    },
    ListItemInfo: {
        createdAt: (parent, args, context, info) => {
            return new Date(Number(parent.createdAt)).toISOString();
        }
    }
};

module.exports = resolvers;