const { listItems, users } = require('../db/database')
const { getDriver } = require('../db/neo4j')

async function seedUsers(session, id) {
    let writeTxResultPromise = session.writeTransaction(async txc => {
            
        let result = await txc.run(
        `
        CREATE(user:User {id:$id, name:$name, pwd:$pwd})
        `,
            { id: Number(users[id].id), name: users[id].name, pwd: users[id].password },
        )
        if (result != null) {
            return result.records.map(record => ({
                user: record.get('user').properties
            }))
        }
    })
    let txResult = await writeTxResultPromise
}

async function seedListItems(session, listItemId) {
    writeTxResultPromise = session.writeTransaction(async txc => {
        result = await txc.run(
            `
            CREATE(listItem: ListItem {
                id: $id, 
                message: $message, 
                isDone: $isDone, 
                createdAt: $createdAt  
            })
            `,
                { 
                    id: Number(listItems[listItemId].id), 
                    message: listItems[listItemId].message, 
                    isDone: false,
                    createdAt: ((new Date).getTime()).toString()
                }
            )
        if (result != null) {
            return result.records.map(record => ({
                listItem: record.get('listItem').properties
            }))
        }
    })
    txResult = await writeTxResultPromise

    if (listItems[listItemId].assignee != null) {
        writeTxResultPromise = session.writeTransaction(async txc => {
            result = await txc.run(
                `
                MATCH(u:User {id:$uId})
                MATCH(li:ListItem {id: $liId})
                CREATE(li)-[r:ASSIGNED]->(u)
                `,
                {
                    uId: Number(listItems[listItemId].assignee.id),
                    liId: Number(listItems[listItemId].id)
                }
            )
            if (result != null) {
                return result.records.map(record => ({
                    r: record.get('r').properties
                }))
            }
        })
        txResult = await writeTxResultPromise
    }
}

;(async function () {
    const driver = getDriver();
    const session = driver.session();

    try {    
        await seedUsers(session, 0)
        await seedUsers(session, 1)
        await seedUsers(session, 2)
        await seedUsers(session, 3)
        await seedUsers(session, 4)
        
        await seedListItems(session, 0)
        await seedListItems(session, 1)
        await seedListItems(session, 2)
        await seedListItems(session, 3)
        await seedListItems(session, 4)
        await seedListItems(session, 5)
        await seedListItems(session, 6)
        await seedListItems(session, 7)
        await seedListItems(session, 8)
        await seedListItems(session, 9)
        await seedListItems(session, 10)
        await seedListItems(session, 11)
        await seedListItems(session, 12)
        await seedListItems(session, 13)
        await seedListItems(session, 14)
        await seedListItems(session, 15)
        await seedListItems(session, 16)
        await seedListItems(session, 17)
        await seedListItems(session, 18)
        await seedListItems(session, 19)
        
        console.log(`\nDatabase successfully seeded with 5 users, 20 list items and 18 relations.\n`) 
        process.exit(0)
    } catch (err) {
        console.log(`\nError occurred seeding the nodes and relations (seed the db)\n\n${err}`) 
        process.exit(1)
    } finally {
        session.close();
    }
})()