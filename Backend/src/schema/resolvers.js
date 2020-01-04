const Tag = require('../dto/tag');
const Monat = require('../dto/monat');
const Jahr = require('../dto/jahr');
const utils = require('../utils/utils');
const { User } = require('../dto/user');
const jwtService = require('../jwt/service');


const resolvers = {
    Query: {
        getJahr: async function (parent, args, context, info) {
            let jahr;
            const session = context.driver.session();

            try {
                let writeTxResultPromise = session.writeTransaction(async txc => {
                    let result = await txc.run(
                    `
                    MATCH (user: User { id: $id })                          
                    RETURN user
                        `,
                        { id: Number(args.userId) },
                    )
                    if (result != null) {
                        return result.records.map(record => ({
                            user: record.get('user') != undefined ? record.get('user').properties : null
                        }))
                    }
                })
                let txResult = await writeTxResultPromise
                user = txResult[0] != undefined ? txResult[0].user : null;

                if(user != null) {
                    writeTxResultPromise = session.writeTransaction(async txc => {
                        result = await txc.run(
                        `
                        MATCH(user: User {id: $id})
                        MATCH(user)-[:HAS_WORKED_ON]->(tag: Tag {year: $year})
                        RETURN tag
                        `,
                            {
                                id: Number(args.userId),
                                year: Number(args.number)
                            }
                        )
                        if (result != null) {
                            return result.records.map(record => ({
                                tag: record.get('tag') != undefined ? record.get('tag').properties : null
                            }))
                        }
                    })    
                    txResult = await writeTxResultPromise
                    jahr = new Jahr(Number(args.number), Array(12).fill(null));
                    if(txResult != undefined){
                        txResult.forEach(tag => {
                           if(jahr.months[tag.tag.month-1] == null) {
                               monat = new Monat(tag.tag.month, Array(Number(new Date(args.number, tag.tag.month, 0).getDate())).fill(null))
                               monat.days[tag.tag.day-1] = new Tag(tag.tag.id, Number(tag.tag.day), Number(tag.tag.month), Number(tag.tag.year), tag.tag.work, tag.tag.duration);
                               jahr.months[tag.tag.month-1] = monat;
                           } else {
                            jahr.months[tag.tag.month-1].days[tag.tag.day-1] =  new Tag(tag.tag.id, Number(tag.tag.day), Number(tag.tag.month), Number(tag.tag.year), tag.tag.work, tag.tag.duration);
                           }
                        })
                    }
                    return jahr;
                } else {
                    throw new Error('Wrong user id.');
                } 
            } finally {
                session.close();
            }
        },
        getProfile: async function (parent, args, context, info) {
            const session = context.driver.session();
            try {
                let writeTxResultPromise = session.writeTransaction(async txc => {
                    let result = await txc.run(
                    `
                    MATCH (user: User { id: $id })                          
                    RETURN user
                        `,
                        { id: Number(args.userId) },
                    )
                    if (result != null) {
                        return result.records.map(record => ({
                            user: record.get('user') != undefined ? record.get('user').properties : null
                        }))
                    }
                    return;
                })
                let txResult = await writeTxResultPromise
                return  txResult[0] != undefined ? txResult[0].user : null;
            } finally {
                session.close()
            }
        }     
    },
    Mutation: {        
        setWorkAndDuration: async function(parent, args, context, info) {
            let todayDay = new Date().toLocaleString('en-us', {weekday:'long'});
            let todayDate = new Date().toISOString().slice(0,10);
            //let todayDate = args.date;
            
            // disable 'if' logic for debugging purposes on weekends
            if(/*false*/ todayDay === 'Saturday' || todayDay === 'Sunday') {
                throw new Error('Booking work on weekends is not allowed.')
            } else {
                const session = context.driver.session()

                try {
                    let writeTxResultPromise = session.writeTransaction(async txc => {
                        let result = await txc.run(
                        `
                        MATCH (user: User { id: $id })                          
                        RETURN user
                            `,
                            { id: Number(args.userId) },
                        )
                        if (result != null) {
                            return result.records.map(record => ({
                                user: record.get('user') != undefined ? record.get('user').properties : null
                            }))
                        }
                    })
                    let txResult = await writeTxResultPromise
                    user = txResult[0] != undefined ? txResult[0].user : null;
                    
                if(user != null) {
                    writeTxResultPromise = session.writeTransaction(async txc => {
                        result = await txc.run(
                        `
                        MATCH(tag: Tag {day: $day, month: $month, year: $year})
                        RETURN tag
                        `,
                            {   
                                day: Number(todayDate.split('-')[2]),
                                month: Number(todayDate.split('-')[1]),
                                year: Number(todayDate.split('-')[0])                               
                            }
                        )
                        if (result != null) {
                            return result.records.map(record => ({
                                tag: record.get('tag') != undefined ? record.get('tag').properties : null
                            }))
                        }
                    })
                    txResult = await writeTxResultPromise
                    isTagAlreadyBooked = txResult[0] != undefined ? txResult[0].tag : null;

                    if(isTagAlreadyBooked == null) {
                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(
                            `
                            MATCH(N:Tag)  
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

                        largestID = txResult[0] == undefined ? 0 : txResult[0].largestID; 

                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(
                            `
                            CREATE(tag: Tag {id: $id, day: $day, month: $month, year: $year, work: $work, duration: $duration})
                            `,
                                {   
                                    id: Number(largestID+1),
                                    day: Number(todayDate.split('-')[2]),
                                    month: Number(todayDate.split('-')[1]),
                                    year: Number(todayDate.split('-')[0]),
                                    work: args.work,
                                    duration: Number(args.duration)
                                }
                            )
                            if (result != null) {
                                return result.records.map(record => ({
                                    tag: record.get('tag') != undefined ? record.get('tag').properties : null
                                }))
                            }
                        })
                        txResult = await writeTxResultPromise
                        
                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(
                            `
                            MATCH(user: User {id: $id})
                            MATCH(tag: Tag {id: $tagId})
                            CREATE (user)-[:HAS_WORKED_ON]->(tag)
                            `,
                                {
                                    id: Number(args.userId),
                                    tagId: Number(largestID+1)
                                }
                            )
                            if (result != null) {
                                return result.records.map(record => ({
                                    tag: record.get('tag') != undefined ? record.get('tag').properties : null
                                }))
                            }
                        })    
                        txResult = await writeTxResultPromise

                        return 'Your workload for today was successfully booked.'   
                    } else {
                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(
                            `
                            MATCH(tag: Tag {day: $day, month: $month, year: $year})
                            SET tag.work = $work, tag.duration = $duration
                            `,
                                {   
                                    day: Number(todayDate.split('-')[2]),
                                    month: Number(todayDate.split('-')[1]),
                                    year: Number(todayDate.split('-')[0]),
                                    work: args.work,
                                    duration: Number(args.duration)                               
                                }
                            )
                            if (result != null) {
                                return result.records.map(record => ({
                                    tag: record.get('tag') != undefined ? record.get('tag').properties : null
                                }))
                            }
                        })
                        txResult = await writeTxResultPromise
    
                        return 'Your workload for today was successfully updated.' 
                    }                     
                    } else {
                        throw new Error('Wrong user id.');
                    }
                }
                finally {
                    session.close();
                }
            }

        }
        ,
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
                                user: record.get('user') != undefined ? record.get('user').properties : null
                            }))
                        }
                    })
                    let txResult = await writeTxResultPromise
                    user = txResult[0] != undefined ? txResult[0].user : undefined;

                    let sOptions = {
                        issuer: "Authorization",
                        subject: user != undefined ? user.name : null,
                        audience: "HTW Alumni"
                    }

                    return user != undefined ? [jwtService.sign({}, sOptions), user.id, user.name ]: ["Wrong username and/or password!"];
                }
                finally {
                    session.close();
                }
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
                            MATCH(N: User)  
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

                        largestID = txResult[0] == undefined ? 0 : txResult[0].largestID; 

                        writeTxResultPromise = session.writeTransaction(async txc => {
                            result = await txc.run(                           
                            `
                            CREATE(user: User { id: $id, name: $name, pwd: $pwd, wage: $wage})                          
                            RETURN user
                            `,
                                { id: largestID+1, name: args.name, pwd: args.pwd, wage: args.wage },
                            )
                            if (result != null) {                                
                                return result.records.map(record => ({
                                    user: record.get('user').properties
                                }))
                            }
                            return;
                        })
                        txResult = await writeTxResultPromise
                        
                        return txResult[0].user
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
    }
};

module.exports = resolvers;