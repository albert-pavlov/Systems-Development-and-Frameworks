const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const db = require('./database');
const utils = require('./utils');


const server = new ApolloServer({ typeDefs, resolvers });
const { query, mutate } = createTestClient(server);

let variables

describe('mutate', () => {
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
        it('adds a new listItem', async () => {
            variables = { message: 'adds a new listItem' }
            const expected = {
                data: {
                    createListItem: {
                        id: expect.any(Number),
                        message: variables.message,
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })
        it('generates a random ID', async () => {
            variables = { message: 'generates a random ID' }
            const expected = {
                data: {
                    createListItem: {
                        id: expect.any(Number),
                        message: variables.message,
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })
        it('initializes listItem as "not done yet"', async () => {
            variables = { message: 'initializes listItem as "not yet done"' }
            const expected = {
                data: {
                    createListItem: {
                        id: expect.any(Number),
                        message: variables.message,
                        isDone: false,
                        createdAt: expect.any(String)
                    }
                }
            }
            await expect(mutate({ mutation: createListItem, variables })).resolves.toMatchObject(expected)
        })
    })

    describe('finishListItem', () => {
        const finishListItem = gql`
        mutation finishListItem($id: Int!) {
            finishListItem(id: $id) {
              id
              message
              isDone
              createdAt
            }
          }`

        it('rejects if ID is missing', async () => {
            variables = {}
            const expected = {
                data: undefined
            }
            await expect(mutate({ mutation: finishListItem, variables })).resolves.toMatchObject(expected)
        })
        describe('given an ID', () => {
            it('marks an existing listITem as done', async () => {
                variables = { id: 8 }
                const expected = {
                    data: {
                        finishListItem: {
                            id: variables.id,
                            message: expect.any(String),
                            isDone: true,
                            createdAt: expect.any(String)
                        }
                    }
                }
                await expect(mutate({ mutation: finishListItem, variables })).resolves.toMatchObject(expected)

                variables = { id: 9 }
                const _expected = {
                    data: {
                        finishListItem: {
                            id: variables.id,
                            message: expect.any(String),
                            isDone: true,
                            createdAt: expect.any(String)
                        }
                    }
                }
                await expect(mutate({ mutation: finishListItem, variables })).resolves.toMatchObject(_expected)
            })
            it('returns entire listItem item', async () => {
                variables = { id: 8 }
                const expected = {
                    data: {
                        finishListItem: {
                            id: variables.id,
                            message: expect.any(String),
                            isDone: true,
                            createdAt: expect.any(String)
                        }
                    }
                }
                await expect(mutate({ mutation: finishListItem, variables })).resolves.toMatchObject(expected)
            })
        })
    })

    describe('deleteListItem', () => {
        const deleteListItem = gql`
        mutation deleteListItem($id: Int!) {
            deleteListItem(id: $id) {
            id
            message
            isDone
            createdAt
            }
        }`
        describe('given an ID', () => {
            it('deletes a listItem', async () => {
                variables = { id: 4 }
                const expected = {
                    data: {
                        deleteListItem: {
                            id: 4,
                            message: 'Bar',
                            isDone: false,
                            createdAt: '2019-11-15T03:30:00.000Z'
                        }
                    }
                }
                await expect(mutate({ mutation: deleteListItem, variables })).resolves.toMatchObject(expected)
            })
            describe('but if ID is invalid', () => {
                it('returns \'null\'', async () => {
                    variables = { id: 187 }
                    const expected = {
                        data: {
                            deleteListItem: null
                        }
                    }
                    await expect(mutate({ mutation: deleteListItem, variables })).resolves.toMatchObject(expected)
                })
            })
        })
    })
})

describe('query', () => {
    describe('listItems', () => {
        const getAllListItems = gql`        
        query getAllListItems($isDone: Boolean, $orderBy: ORDERBY) {
            getAllListItems(isDone: $isDone, orderBy: $orderBy) {
                id
                message
                isDone
                createdAt
            }
        }`
        it('returns a list of some listItems', async () => {
            variables = { }
            let tempListItems = JSON.parse(JSON.stringify(db.listItems));
            tempListItems.forEach(listItem => {
                listItem.createdAt = new Date(Number(listItem.createdAt)).toISOString()
            })
            const expected = {
                data: {
                    getAllListItems: tempListItems
                }
            }
            await expect(query({ query: getAllListItems, variables })).resolves.toMatchObject(expected)
        })
        describe('input arguments', () => {
            describe('(done: false)', () => {
                it('returns unfinished listItems only', async () => {
                    variables = { isDone: false }
                    let tempListItems = JSON.parse(JSON.stringify(listItems));                    
                    tempListItems.forEach(listItem => {
                        listItem.createdAt = new Date(Number(listItem.createdAt)).toISOString()
                    })
                    const allNotDoneListItems =
                        (variables.isDone == true || variables.isDone == false) ?
                        tempListItems.filter(listItem => listItem.isDone == variables.isDone)
                            : tempListItems;
                    const expected = {
                        data: {
                            getAllListItems: allNotDoneListItems
                        }
                    }
                    await expect(query({ query: getAllListItems, variables })).resolves.toMatchObject(expected)
                })
            })
            describe('(orderBy: "desc")', () => {
                it('orders listItems by creation time in descending order', async () => {
                    variables = { orderBy: utils.ORDERBY.desc }
                    let tempListItems = utils.sortListItemsByOrder(listItems, variables.orderBy);                    
                    tempListItems.forEach(listItem => {
                        listItem.createdAt = new Date(Number(listItem.createdAt)).toISOString()
                    })                   
                    const expected = {
                        data: {
                            getAllListItems: tempListItems
                        }
                    }
                    await expect(query({ query: getAllListItems, variables })).resolves.toMatchObject(expected)
                })
            })
            describe('orderBy: "asc")', () => {
                it('orders listItems by creation time in ascending order', async () => {
                    variables = { orderBy: utils.ORDERBY.asc }
                    let tempListItems = utils.sortListItemsByOrder(listItems, variables.orderBy);                    
                    tempListItems.forEach(listItem => {
                        listItem.createdAt = new Date(Number(listItem.createdAt)).toISOString()
                    })                   
                    const expected = {
                        data: {
                            getAllListItems: tempListItems
                        }
                    }
                    await expect(query({ query: getAllListItems, variables })).resolves.toMatchObject(expected)
                })
            })
        })
    })
})    