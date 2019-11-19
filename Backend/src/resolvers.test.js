const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const server = new ApolloServer({ typeDefs, resolvers });
const { query, mutate } = createTestClient(server);

let variables

describe('mutate', () => {
    describe('deleteListItem', () => {
        const deleteListItem = gql`
        mutation deleteListItem($id: Int!) {
            deleteListItem(id: $id) {
            id
            message
            isDone
            createdAt
            }
        }
    `
        describe('given an ID', () => {
            it('deletes a listItem', async () => {
                variables = { id: 4 }
                const { data } = await mutate({ mutation: deleteListItem, variables })
                const expected = {                    
                      deleteListItem: {
                        id: 4,
                        message: 'Bar',
                        isDone: false,
                        createdAt: '11/15/2019, 4:30:00 AM'
                      }
                    }
                expect(data).toMatchObject(expected)
            })
            describe('but if ID is invalid', () => {
                // try to delete a listItem with ID 4, which was just deleted in the test above, it's to say, an invalid ID
                it('returns \'null\'', async () => {
                    variables = { id: 4 }
                    const { data } = await mutate({ mutation: deleteListItem, variables })
                    const expected = {                        
                          deleteListItem: null
                        }
                    expect(data).toMatchObject(expected)
                })
            })
        })
    })
})