const { createTestClient } = require('apollo-server-testing');
const { getTestServer } = require('./servers');
const { gql } = require('apollo-server');
const { closeDriver } = require('../db/neo4j')


const testServer = getTestServer();
const testClient = createTestClient(testServer);

let variables, mutate, query

afterAll(async()=>{
	closeDriver();
})

describe('Mutatations requiring auth', () => {    
    beforeEach(async()=>{
        const loginMutation = gql`
        mutation login($usr:String!, $pwd:String!) {
            login(usr:$usr, pwd:$pwd)
          }`
		const response = await testClient.mutate({
			mutation: loginMutation,
			variables: { usr: 'Mallory', pwd: '123456' }
        })        
        let jwt = response.data.login
		const testServer = getTestServer(jwt[0]);
		mutate = createTestClient(testServer).mutate;
    });

    describe('createListItem', () => {
        const createListItem = gql`
        mutation createListItem($message: String!) {
            createListItem(message: $message) {
              id
              message
              isDone
              createdAt              
            }
          }`

        it('adds a new listItem for nobody (assignee == null)', async () => {
            variables = { message: 'A listItem for nobody (assignee == null)' }
            const expected = {
                errors: undefined,
                data: {
                    createListItem: {
                        id: expect.any(String),
                        message: variables.message,
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })

        it('adds a new listItem for self (assignee == assignor)', async () => {
            variables = { message: 'A listItem for nobody (assignee == assignor)', assigneeID: 4 }
            const expected = {
                errors: undefined,
                data: {
                    createListItem: {
                        id: expect.any(String),
                        message: variables.message,
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })

        it('adds a new listItem for somebody else (assignee != assignor)', async () => {
            variables = { message: 'A listItem for nobody (assignee != assignor)', assigneeID: 1 }
            const expected = {
                errors: undefined,
                data: {
                    createListItem: {
                        id: expect.any(String),
                        message: variables.message,
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })

        describe('tries to read assignee of newly created listItem', () => {
            const createListItem = gql`
            mutation createListItem($message: String!, $assigneeID: ID) {
                createListItem(message: $message, assigneeID: $assigneeID) {
                  id
                  message
                  isDone
                  createdAt               
                  assignee {
                      id
                      name
                  }
                }
              }`
    
            it('should be allowed for nobody (assignee == null)', async () => {
                variables = { message: 'A listItem for nobody (assignee == null)' }
                const expected = {
                    errors: undefined,
                    data: {
                        createListItem: {
                            id: expect.any(String),
                            message: variables.message,
                            isDone: false,
                            createdAt: expect.any(String),
                            assignee: null
                        }
                    }
                }
                await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
            })
    
            it('should be allowed for self (assignee == assignor)', async () => {
                variables = { message: 'A listItem for nobody (assignee == assignor)', assigneeID: 4 }
                const expected = {
                    errors: undefined,
                    data: {
                        createListItem: {
                            id: expect.any(String),
                            message: variables.message,
                            isDone: false,
                            createdAt: expect.any(String),
                            assignee: {
                                id: '4',
                                name: 'Mallory'
                            }
                        }
                    }
                }
                await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
            })
    
            it('should fail for somebody else (assignee != assignor) [auth error]', async () => {
                variables = { message: 'A listItem for nobody (assignee != assignor)', assigneeID: 3 }
                const expected = {
                    errors: [{
                        message: 'Not Authorised!'
                    }]
                }
                await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
            })            
        })      
    })

    describe('assignListItem', () => {
        const createListItem = gql`
        mutation assignListItem($id: ID!, $assigneeID: ID!) {
            assignListItem(id: $id, assigneeID: $assigneeID) {
              id
              message
              isDone
              createdAt
            }
          }`
        
        it('assigns a listItem to self (assignee\'s in DB)', async () => {
        variables = { id: 9,  assigneeID: 4 }
            const expected = {
                errors: undefined,
                data: {
                    assignListItem: {
                        id: expect.any(String),
                        message: expect.any(String),
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })
        
        it('assigns a listItem to existing assignee (assignee\'s in DB)', async () => {
            variables = { id: 6,  assigneeID: 1 }
            const expected = {
                errors: undefined,
                data: {
                    assignListItem: {
                        id: expect.any(String),
                        message: expect.any(String),
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })

        it('assigns a listItem to non-existing assignee (assignee\'s not in DB). Should return [error message]', async () => {
            variables = { id: 6,  assigneeID: 6 }
            let  createListItem = gql`
            mutation assignListItem($id: ID!, $assigneeID: ID!) {
                assignListItem(id: $id, assigneeID: $assigneeID) {
                  id
                  message
                  isDone
                  createdAt
                  assignee {
                      id
                      name
                  }
                }
              }`
            const expected = {
                errors: [{
                    message: 'Assignee with such ID doesn\'t exist.'
                }]  
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })

        describe('tries to read assignee of newly assigned listItem', () => {
            const assignListItem = gql`
            mutation assignListItem($id: ID!, $assigneeID: ID!) {
                assignListItem(id: $id, assigneeID: $assigneeID) {
                  id
                  message
                  isDone
                  createdAt
                  assignee {
                      id
                      name
                  }
                }
              }`
    
            it('should fail for non-existing assignee (assignee\'s not in DB) [error message]', async () => {
                variables = { id: 6, assigneeID: 187 }
                const expected = {
                    errors: [{
                        message: 'Assignee with such ID doesn\'t exist.'
                    }]  
                }
                await expect(mutate({ mutation: assignListItem, variables })).resolves.toMatchObject(expected)
            })    

            it('should be allowed for self (assignee == assignor)', async () => {
                variables = { id: 6, assigneeID: 4 }
                const expected = {
                    errors: undefined,
                    data: {
                        assignListItem: {
                            id: expect.any(String),
                            message: expect.any(String),
                            isDone: false,
                            createdAt: expect.any(String),
                            assignee: {
                                id: '4',
                                name: 'Mallory'
                            }
                        }
                    }
                }
                await expect(mutate({ mutation: assignListItem, variables })).resolves.toMatchObject(expected)
            })

            it('should fail for somebody else (assignee\'s in DB and != assignor) [auth error]', async () => {
                variables = { id: 9, assigneeID: 2 }
                const expected = {                    
                    errors: [{
                        message: 'Not Authorised!'
                    }]                    
                }
                await expect(mutate({ mutation: assignListItem, variables })).resolves.toMatchObject(expected)
            })                     
        })             
    })

    describe('finishListItem', () => {
        const finishListItem = gql`
        mutation finishListItem($id: ID!) {
            finishListItem(id: $id) {
              id
              message
              isDone
              createdAt
            }
          }`
        
        it('finishes a listItem assigned to self', async () => {
            variables = { id: 4 }
            const expected = {
                errors: undefined,
                data: {
                    finishListItem: {
                        id: expect.any(String),
                        message: expect.any(String),
                        isDone: true,
                        createdAt: expect.any(String)                        
                    }
                }
            }
            await expect(mutate({ mutation: finishListItem, variables })).resolves.toMatchObject(expected)
        })
        
        it('fails to finish a listItem assigned to somedoby else [auth error]', async () => {
            variables = { id: 3 }
            const expected = {                    
                errors: [{
                    message: 'Not Authorised!'
                }]                    
            }
            await expect(mutate({ mutation: finishListItem, variables })).resolves.toMatchObject(expected)
        })
        
    })

    describe('deleteListItem', () => {
        const deleteListItem = gql`
        mutation deleteListItem($id: ID!) {
            deleteListItem(id: $id) {
              id
              message
              isDone
              createdAt
            }
          }`
        
        it('deletes a listItem assigned to self', async () => {
            variables = { id: 4 }
            const expected = {
                errors: undefined,
                data: {
                    deleteListItem: {
                        id: expect.any(String),
                        message: expect.any(String),
                        isDone: true,
                        createdAt: expect.any(String)                        
                    }
                }
            }
            await expect(mutate({ mutation: deleteListItem, variables })).resolves.toMatchObject(expected)
        })
        
        it('fails to delete a listItem assigned to somedoby else [auth error]', async () => {
            variables = { id: 3 }
            const expected = {                    
                errors: [{
                    message: 'Not Authorised!'
                }]                    
            }
            await expect(mutate({ mutation: deleteListItem, variables })).resolves.toMatchObject(expected)
        })        
    })  
})

describe('Queries requiring auth', () => {    
    beforeEach(async()=>{
        const loginMutation = gql`
        mutation login($usr:String!, $pwd:String!) {
            login(usr:$usr, pwd:$pwd)
          }`
		const response = await testClient.mutate({
			mutation: loginMutation,
			variables: { usr: 'Mallory', pwd: '123456' }
        })        
        let jwt = response.data.login

        const testServer = getTestServer(jwt[0]);
		query = createTestClient(testServer).query;
    });

    describe('getOneListItem', () => {
        const getOneListItem = gql`
        query getOneListItem($id: ID!) {
            getOneListItem(id: $id) {
              id
              message
              isDone
              createdAt
            }
          }`

          it('retrieves a listItem assigned to self (without information about assignee)', async () => {
            variables = { id: 5 }
            const expected = {
                errors: undefined,
                data: {
                    getOneListItem: {
                        id: expect.any(String),
                        message: expect.any(String),
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(query({ query: getOneListItem, variables })).resolves.toMatchObject(expected)
        })

        it('retrieves a listItem assigned to self (with information about assignee)', async () => {
            variables = { id: 5 }
            const getOneListItem = gql`
            query getOneListItem($id: ID!) {
                getOneListItem(id: $id) {
                  id
                  message
                  isDone
                  createdAt
                  assignee {
                    id 
                    name
                  }
                }
              }`
            const expected = {
                data: {
                    getOneListItem: {
                        id: expect.any(String),
                        message: expect.any(String),
                        isDone: false,
                        createdAt: expect.any(String),
                        assignee: {
                            id: '4',
                            name: 'Mallory'
                        }
                    }
                }
            }
            await expect(query({ query: getOneListItem, variables })).resolves.toMatchObject(expected)
        })

        it('fails to retrieve a listItem assigned to somebody else [auth error]', async () => {
            variables = { id: 1 }
            const expected = {                    
                errors: [{
                    message: 'Not Authorised!'
                }]                    
            }
            await expect(query({ query: getOneListItem, variables })).resolves.toMatchObject(expected)
        })
    })  

    describe('getAllListItems', () => {
        const getAllListItems = gql`
        query getAllListItems($isDone: Boolean, $orderBy: ORDERBY) {
            getAllListItems(isDone: $isDone, orderBy: $orderBy) {
              id
              message
              isDone
              createdAt
            }
          }`

        it('retrieves all listItems without information whom they are assigned to', async () => {            
            const expected = {
                errors: undefined,
                data: {
                    getAllListItems: expect.any(Array)
                }
            }           
            await expect(query({ query: getAllListItems })).resolves.toMatchObject(expected)
        })

        it('fails to retrieve all listItems with information about assignees [auth error]', async () => {    
            const getAllListItems = gql`
            query getAllListItems($isDone: Boolean, $orderBy: ORDERBY) {
                getAllListItems(isDone: $isDone, orderBy: $orderBy) {
                    id
                    message
                    isDone
                    createdAt
                    assignee {
                        id
                        name
                    }
                }
            }`        
            const expected = {
                errors: expect.any(Array)
            }
            await expect(query({ query: getAllListItems })).resolves.toMatchObject(expected)
        })
    })
})

describe('Mutatations without auth', () => {    
    beforeEach(async()=>{
        const testServer = getTestServer({});
		mutate = createTestClient(testServer).mutate;
	});

    describe('createUser', () => {
        const createUser = gql`
        mutation createUser($name: String!, $pwd: String!) {
            createUser(name:$name, pwd:$pwd) {
              id
              name
            }
          }`

        it('creates a new user', async () => {
            variables = { name: 'Max', pwd: '123456' }
            const expected = {
                errors: undefined,
                data: {
                    createUser: {
                        id: expect.any(String),
                        name: 'Max'
                    }
                }
            }
            await expect(mutate({ mutation: createUser, variables })).resolves.toMatchObject(expected)
        })

        it('tries to create a new user with already existing user name [error message]', async () => {
            variables = { name: 'Max', pwd: '123456' }
            const expected = {
                errors: [{
                    message: 'Username already in use. Please select a different one and try again.'
                }]
            }
            await expect(mutate({ mutation: createUser, variables })).resolves.toMatchObject(expected)
        })
    })

    describe('login', () => {
        const login = gql`
        mutation login($usr:String!, $pwd:String!) {
            login(usr:$usr, pwd:$pwd)
          }`
          
        it('logs a user in and returns a jwt (proper user data)', async () => {
            variables = { usr: 'Alice', pwd: '123456' }
            const expected = {
                errors: undefined,
                data: {
                    login: expect.any(Array),
                }
            }
            await expect(mutate({ mutation: login, variables })).resolves.toMatchObject(expected)
        })

        it('tries to login a user with false user data ["Wrong username and/or password!"]', async () => {
            variables = { usr: 'Ecila', pwd: '654321' }
            const expected = {
                errors: undefined,
                data: {
                    login: ['Wrong username and/or password!']
                }
            }
            await expect(mutate({ mutation: login, variables })).resolves.toMatchObject(expected)
        })
    })

    describe('createListItem', () => {
        const createListItem = gql`
        mutation createListItem($message: String!) {
            createListItem(message: $message) {
              id
              message
              isDone
              createdAt              
            }
          }`

        it('tries to create a new listItem [auth error]', async () => {
            variables = { message: 'A listItem for [auth error]' }
            const expected = {                    
                errors: [{
                    message: 'Not Authorised!'
                }]                    
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })
    })

    describe('assignListItem', () => {
        const assignListItem = gql`
        mutation assignListItem($id: ID!, $assigneeID: ID!) {
            assignListItem(id: $id, assigneeID: $assigneeID) {
              id
              message
              isDone
              createdAt
            }
          }`
        
        it('tries to assign a listItem [auth error]', async () => {
        variables = { id: 9,  assigneeID: 4 }
        const expected = {                    
            errors: [{
                message: 'Not Authorised!'
            }]                    
        }
            await expect(mutate({ mutation: assignListItem, variables })).resolves.toMatchObject(expected)
        })
    })

    describe('finishListItem', () => {
        const finishListItem = gql`
        mutation finishListItem($id: ID!) {
            finishListItem(id: $id) {
              id
              message
              isDone
              createdAt
            }
          }`
        
        it('tries to finish a listItem [auth error]', async () => {
        variables = { id: 7 }
        const expected = {                    
            errors: [{
                message: 'Not Authorised!'
            }]                    
        }
            await expect(mutate({ mutation: finishListItem, variables })).resolves.toMatchObject(expected)
        })
    })

    describe('deleteListItem', () => {
        const deleteListItem = gql`
        mutation deleteListItem($id: ID!) {
            deleteListItem(id: $id) {
              id
              message
              isDone
              createdAt
            }
          }`
        
        it('tries to assign a listItem [auth error]', async () => {
        variables = { id: 5 }
        const expected = {                    
            errors: [{
                message: 'Not Authorised!'
            }]                    
        }
            await expect(mutate({ mutation: deleteListItem, variables })).resolves.toMatchObject(expected)
        })
    })
})

describe('Queries without auth', () => {    
    beforeEach(async()=>{
        const testServer = getTestServer({});
		query = createTestClient(testServer).query;
    });

    describe('getOneListItem', () => {
        const getOneListItem = gql`
        query getOneListItem($id: ID!) {
            getOneListItem(id: $id) {
              id
              message
              isDone
              createdAt
            }
          }`

        it('fails to retrieve a listItem assigned to self [auth error]', async () => {
            variables = { id: 5 }
            const expected = {
                errors: [{
                    message: 'Not Authorised!'
                }]
            }
            await expect(query({ query: getOneListItem, variables })).resolves.toMatchObject(expected)
        })

        it('fails to retrieve a listItem assigned to somedy else [auth error]', async () => {
            variables = { id: 1 }
            const expected = {
                errors: [{
                    message: 'Not Authorised!'
                }]
            }
            await expect(query({ query: getOneListItem, variables })).resolves.toMatchObject(expected)
        })
    })

    describe('getAllListItems', () => {
        const getAllListItems = gql`
        query getAllListItems($isDone: Boolean, $orderBy: ORDERBY) {
            getAllListItems(isDone: $isDone, orderBy: $orderBy) {
              id
              message
              isDone
              createdAt
            }
          }`

        it('fails to retrieve all listItems [auth error]', async () => {            
            const expected = {
                errors: [{
                    message: 'Not Authorised!'
                }]
            }          
            await expect(query({ query: getAllListItems })).resolves.toMatchObject(expected)
        })

        it('fails to retrieve all listItems with information about assignees [auth error]', async () => {    
            const getAllListItems = gql`
            query getAllListItems($isDone: Boolean, $orderBy: ORDERBY) {
                getAllListItems(isDone: $isDone, orderBy: $orderBy) {
                    id
                    message
                    isDone
                    createdAt
                    assignee {
                        id
                        name
                    }
                }
            }`        
            const expected = {
                errors: expect.any(Array)
            }
            await expect(query({ query: getAllListItems })).resolves.toMatchObject(expected)
        })
    })
})
