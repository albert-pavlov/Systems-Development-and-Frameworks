const { createTestClient } = require('apollo-server-testing');
const { getTestServer } = require('../servers/servers');
const { gql } = require('apollo-server');
const { listItems, users } = require('../db/database')
const getDriver = require('../db/neo4j')
const testServer = getTestServer();
const testClient = createTestClient(testServer);

let variables

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
; (async function () {
    
    try {
    const createUser = gql`
    mutation createUser($name: String!, $pwd: String!) {
        createUser(name:$name, pwd:$pwd) {
            id
            name
        }
    }`
    let testServer = getTestServer(()=>{return {}});
    let { mutate } = createTestClient(testServer);
    let usersWithRandomId = []
    users.forEach(async (user) => {
            await sleep(user.id*300)
            variables = { name: user.name, pwd: user.password };
            const userData = await mutate({ mutation: createUser, variables });
            console.log(userData.data.createUser);
            usersWithRandomId.push(userData.data.createUser);
    })
    await sleep(2000);
    console.log(usersWithRandomId)
    const loginMutation = gql`
        mutation login($usr:String!, $pwd:String!) {
            login(usr:$usr, pwd:$pwd)
          }`
    const response = await testClient.mutate({
        mutation: loginMutation,
        variables: { usr: "Mallory", pwd: "123456" }
    })
    let jwt = response.data.login
    testServer = getTestServer(() => { return { token: jwt } });
	mutate = createTestClient(testServer).mutate;

    listItems.forEach(li => {
        usersWithRandomId.forEach(upd => {
           if(li.assignee!=null && li.assignee.name == upd.name) {
                li.assignee.id = upd.id;
                console.log('assignee.id: ', li.assignee.id)
            }
        })
    })
    await sleep(4000);
    const createListItem = gql`
        mutation createListItem($message: String!) {
            createListItem(message: $message) {
              id
              message
              isDone
              createdAt              
            }
          }`

    listItems.forEach(async listItem => {
        variables = { message: listItem.message, assigneeID: listItem.assignee !=null ? listItem.assignee.id: null }
        const liData = await mutate({ mutation: createListItem, variables })
        console.log(liData.data.createListItem);
    })

    process.exit(0)
    } catch (err) {
      console.log(`\nError occurred seeding the nodes and relations (seed the db)\n\n${err}`) 
      process.exit(1)
    }
})()