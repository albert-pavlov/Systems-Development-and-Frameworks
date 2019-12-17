const db = require('../db/database');
const utils = require('../utils/utils');
const { ListItem, ListItemInfo } = require("../dto/listItem");
const { User, UserInfo } = require('../dto/user');
const jwtService = require('../jwt/service');


const resolvers = {
    Query: {
        getOneListItem: async function (parent, args, context, info) {
            let listItemInfo;
            let listItem;
            let user;

            const session = context.driver.session();

            try {
                let writeTxResultPromise = session.writeTransaction(async txc => {
                    let result = await txc.run(
                        `
                        MATCH (listItem: ListItem { id: $id })
                        MATCH (user:User)<-[:ASSIGNED]-(listItem)
                        RETURN listItem, user
                         `,
                            { id: Number(args.id) },
                        )
                    if (result != null) {
                        return result.records.map(record => ({
                            listItem: record.get('listItem').properties,
                            user: record.get('user').properties
                        }))
                    }
                    return;
                })
                let txResult = await writeTxResultPromise

                listItem = txResult[0] != undefined ? txResult[0].listItem : null;
                user = txResult[0] != undefined ? txResult[0].user : null;
                
                if (listItem != null) {                    
                    listItem.assignee = user;
                    listItemInfo = new ListItemInfo(listItem);
                }
                return listItemInfo;
            } finally {
                session.close()
            }
        },        
        getAllListItems: async function(parent, args, context, info) {
            let allListItems = [];
            const session = context.driver.session();

            /*
                MATCH(allListItems: ListItem)
                WHERE(allListItems.isDone = false)
                RETURN allListItems
                ORDER BY (allListItems.createdAt) ASC
            */

            cypher = 'MATCH(allListItems: ListItem) ';
            if(typeof(args.isDone) === 'boolean') {
                cypher+= 'WHERE(allListItems.isDone = '+ args.isDone +') ';
            }
            cypher+= 'RETURN allListItems '
            if(utils.ORDERBY.asc === args.orderBy || utils.ORDERBY.desc === args.orderBy) {
                cypher+= 'ORDER BY (allListItems.createdAt) ' + args.orderBy;
            }
            try {
                let writeTxResultPromise = session.writeTransaction(async txc => {
                    let result = await txc.run(cypher)
                    if (result != null) {
                        return result.records.map(record => ({
                            allListItems: record.get('allListItems').properties
                        }))
                    }
                    return;
                })
                let txResult = await writeTxResultPromise
                if(txResult != undefined) {
                    txResult.forEach( res => {
                        allListItems.push(res.allListItems)
                    })
                }

                
                return allListItems;
            } finally {
                session.close()
            }
        }        
    },
    Mutation: {
        login: async function (parent, args, context, info) {
            if (args.usr != "" && args.usr != null && args.usr != undefined && args.pwd != "" && args.pwd != null && args.pwd != undefined) {

                let user;
                const session = context.driver.session()

                try {
                    let writeTxResultPromise = session.writeTransaction(async txc => {
                        let result = await txc.run(
                            `
                        MATCH (user: User { 
                            name: $name, 
                            pwd: $pwd
                        })                          
                        RETURN user
                         `,
                            { name: args.usr, pwd: args.pwd },
                        )
                        if (result != null) {
                            return result.records.map(record => ({
                                user: record.get('user').properties
                            }))
                        }
                        return;
                    })
                    let txResult = await writeTxResultPromise
                    user = txResult[0].user

                    let sOptions = {
                        issuer: "Authorization",
                        subject: user != undefined ? user.name : null,
                        audience: "HTW Alumni"
                    }

                    return user != undefined ? jwtService.sign({}, sOptions) : "Wrong username and/or password!";
                }
                finally {
                    session.close();
                }
            }
        },
        createListItem: async function(parent, args, context, info) {
            if(args.message != "" && args.message != null && args.message != undefined) {

                let listItem;
                let user;

                const session = context.driver.session()

                try {
                    let writeTxResultPromise = session.writeTransaction(async txc => {
                        let result = await txc.run(
                        `
                        MATCH (user: User { id: $id })                          
                        RETURN user
                         `,
                            { id: args.assigneeID != null ? Number(args.assigneeID) : null },
                        )
                        if (result != null) {
                            return result.records.map(record => ({
                                user: record.get('user').properties
                            }))
                        }
                        return;
                    })
                    let txResult = await writeTxResultPromise
                    user = txResult[0].user
                
                    writeTxResultPromise = session.writeTransaction(async txc => {
                        result = await txc.run(
                        `
                        MATCH(N:ListItem)  
                        RETURN N.id AS largestID
                        ORDER BY N.id DESCENDING 
                        LIMIT 1
                        `)
                        if (result != null) {                           
                            return result.records.map(record => ({
                                largestID: record.get('largestID')
                            }))
                        }
                        return;
                    })

                    txResult = await writeTxResultPromise;
                    largestID = txResult[0] == undefined ? 1 : txResult[0].largestID;
                    let newLargestId = utils.generateRandomId(largestID);                        
                    writeTxResultPromise = session.writeTransaction(async txc => {
                        result = await txc.run(                           
                        `
                        CREATE(listItem: ListItem {
                            id: $id, 
                            message: $message, 
                            isDone: $isDone, 
                            createdAt: $createdAt  
                        })
                        RETURN(listItem)
                        `,
                            { 
                                id: newLargestId, 
                                message: args.message, 
                                isDone: false,
                                createdAt: ((new Date).getTime()).toString()
                            }
                        )
                        if (result != null) {                                
                            return result.records.map(record => ({
                                listItem: record.get('listItem').properties
                            }))
                        }
                        return;
                    })
                    txResult = await writeTxResultPromise;
                    listItem = txResult[0].listItem;

                    if(user!=null) {
                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(                           
                            `
                            MATCH(u:User { id: $uId })
                            MATCH(li:ListItem { id: $liId})
                            CREATE (u)<-[:ASSIGNED]-(li)
                            `,
                                { 
                                    uId: user.id, 
                                    liId: newLargestId
                                }
                            )                            
                        })
                        txResult = await writeTxResultPromise;

                        listItem.assignee = user;                            
                        return listItem;

                    } else {
                        return listItem;
                    }
                }
                finally {
                    session.close();
                }
            }
            return;
        },
        assignListItem: async function (parent, args, context, info) {
            let listItem;
            let user;
            let rel;

            const session = context.driver.session()

            try {
                // check if such list item exists
                let writeTxResultPromise = session.writeTransaction(async txc => {
                    let result = await txc.run(
                        `
                        MATCH(listItem: ListItem { id: $id })                        
                        RETURN listItem
                 `,
                        { 
                            id: Number(args.id)
                        },
                    )
                    if (result != null) {
                        return result.records.map(record => ({
                            listItem: record.get('listItem').properties
                        }))
                    }
                    return;
                })
                let txResult = await writeTxResultPromise
                listItem = txResult[0]!= undefined ? txResult[0].listItem : null;

                // check if the user whom the list item will be assigned to exists
                writeTxResultPromise = session.writeTransaction(async txc => {
                    result = await txc.run(
                        `
                        MATCH(user:User { id: $id})
                        RETURN user
                 `,
                        {
                            id: Number(args.assigneeID)
                        },
                    )
                    if (result != null) {
                        return result.records.map(record => ({
                            user: record.get('user').properties
                        }))
                    }
                    return;
                })
                txResult = await writeTxResultPromise
                user = txResult[0]!= undefined ? txResult[0].user : null;         

                // check if the list item has already been assigned to a different user
                writeTxResultPromise = session.writeTransaction(async txc => {
                    result = await txc.run(
                        `
                        MATCH(listItem: ListItem { id: $id })
                        MATCH(listItem)-[r]->(:User)
                        RETURN r
                 `,
                        {
                            id: Number(args.id),
                        },
                    )
                    if (result != null) {
                        return result.records.map(record => ({
                            rel: record.get('r').properties
                        }))
                    }
                    return;
                })
                txResult = await writeTxResultPromise
                rel = txResult[0]!= undefined ? txResult[0].r : null;               


                if (listItem != null) {
                    if (user != null) {
                        if (rel != null) {                            
                            // delete the relation between the list item and the current assignee
                            // multiple assignments of a single list item are not allowed
                            writeTxResultPromise = session.writeTransaction(async txc => {
                                result = await txc.run(
                                    `
                                    MATCH(listItem: ListItem { id: $id })
                                    MATCH(listItem)-[r]->(:User)
                                    DELETE(r)
                             `,
                                    {
                                        id: Number(args.id)
                                    },
                                )
                            })
                            txResult = await writeTxResultPromise
                        }
                        // reassign the list item to the new user
                        // multiple assignments of a single list item are not allowed
                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(
                                `
                                MATCH(listItem: ListItem { id: $liId })
                                MATCH(user: User { id: $uId})
                                MERGE (user)<-[:ASSIGNED]-(listItem)
                                RETURN listItem, user
                                `,
                                {
                                    liId: Number(args.id),
                                    uId: Number(args.assigneeID)
                                },
                            )
                            if (result != null) {
                                return result.records.map(record => ({
                                    listItem: record.get('listItem').properties,
                                    user: record.get('user').properties,
                                }))
                            }
                            return;
                        })
                        txResult = await writeTxResultPromise
                        listItem = txResult[0].listItem;
                        user = txResult[0].user;
                        listItem.assignee = user;

                        return listItem;
                    } else {
                        throw new Error('Assignee with such ID doesn\'t exist.');
                    }
                } else {
                    throw new Error('List item with such ID doesn\'t exist.');
                }
            } finally {
                session.close()
            }
        },
        finishListItem: async function(parent, args, context, info) {
                let listItemInfo;               
                let listItem;
                let user;

                const session = context.driver.session();

                try {
                    let writeTxResultPromise = session.writeTransaction(async txc => {
                        let result = await txc.run(
                        `
                        MATCH (listItem: ListItem { id: $id })
                        MATCH (user:User)<-[:ASSIGNED]-(listItem)
                        SET listItem.isDone = true                          
                        RETURN listItem, user
                         `,
                            { id: Number(args.id) },
                        )
                        if (result != null) {
                            return result.records.map(record => ({
                                listItem: record.get('listItem').properties,
                                user: record.get('user').properties
                            }))
                        }
                        return;
                    })
                    let txResult = await writeTxResultPromise

                    listItem = txResult[0] != undefined ? txResult[0].listItem : null;
                    user = txResult[0] != undefined ? txResult[0].user : null;
                    if(listItem != null) {
                        listItem.assignee = user;                    
                        listItemInfo = new ListItemInfo(listItem);
                    } 

                    return listItemInfo;
                } finally {
                    session.close()
                }
        },
        deleteListItem: async function (parent, args, context, info) {
            let listItemInfo;
            let listItem;
            let user;

            const session = context.driver.session();

            try {
                let writeTxResultPromise = session.writeTransaction(async txc => {
                    let result = await txc.run(
                        `
                        MATCH (listItem: ListItem { id: $id })
                        MATCH (user:User)<-[:ASSIGNED]-(listItem)
                        RETURN listItem, user
                         `,
                            { id: Number(args.id) },
                        )
                    if (result != null) {
                        return result.records.map(record => ({
                            listItem: record.get('listItem').properties,
                            user: record.get('user').properties
                        }))
                    }
                    return;
                })
                let txResult = await writeTxResultPromise

                listItem = txResult[0] != undefined ? txResult[0].listItem : null;
                user = txResult[0] != undefined ? txResult[0].user : null;
                
                if (listItem != null) {
                    writeTxResultPromise = session.writeTransaction(async txc => {
                        result = await txc.run(
                            `
                        MATCH (listItem: ListItem { id: $id })
                        DETACH DELETE listItem
                         `,
                            { id: Number(args.id) },
                        )
                        if (result != null) {
                            return result.records.map(record => ({
                                listItem: record.get('listItem').properties,
                                user: record.get('user').properties
                            }))
                        }
                        return;
                    })
                    txResult = await writeTxResultPromise

                    listItem.assignee = user;
                    listItemInfo = new ListItemInfo(listItem);
                }
                return listItemInfo;
            } finally {
                session.close()
            }
        },
        createUser: async function (parent, args, context, info) {
            if (args.name != "" && args.name != null && args.name != undefined && args.pwd != "" && args.pwd != null && args.pwd != undefined) {

                let user;
                let largestID;

                const session = context.driver.session();

                try {
                    let writeTxResultPromise = session.writeTransaction(async txc => {
                        let result = await txc.run(
                        `
                        MATCH (user: User { name: $name })                          
                        RETURN user
                         `,
                            { name: args.name },
                        )
                        if (result != null) {
                            return result.records.map(record => ({
                                name: record.get('user').properties
                            }))
                        }
                        return;
                    })
                    let txResult = await writeTxResultPromise
                    user = txResult[0]

                    if (user == null) {
                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(
                            `
                            MATCH(N:User)  
                            RETURN N.id AS largestID
                            ORDER BY N.id DESCENDING 
                            LIMIT 1
                            `)
                            if (result != null) {
                                return result.records.map(record => ({
                                    largestID: record.get('largestID')
                                }))
                            }
                            return;
                        })

                        txResult = await writeTxResultPromise
                        
                        largestID = txResult[0] == undefined ? 1 : txResult[0].largestID;
                        let newLargestId = utils.generateRandomId(largestID); 

                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(                           
                            `
                            CREATE(user: User { id: $id, name: $name, pwd: $pwd})                          
                            RETURN user
                            `,
                                { id: utils.generateRandomId(newLargestId), name: args.name, pwd: args.pwd },
                            )
                            if (result != null) {                                
                                return result.records.map(record => ({
                                    user: record.get('user').properties
                                }))
                            }
                            return;
                        })
                        txResult = await writeTxResultPromise
                        user = txResult[0].user

                        return new UserInfo(user.id, user.name);
                    } else {
                        throw new Error('Username already in use. Please select a different one and try again.')
                    }
                }
                finally {
                    session.close()
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