const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        getAllListItems(isDone: Boolean, orderBy: ORDERBY): [ListItem]
    }

    type Mutation {
        createListItem(message: String!, assigneeID: ID): ListItem
        finishListItem(id: ID!): ListItem
        deleteListItem(id: ID!): ListItem
        createUser(name: String!, pwd: String!): User
        login(usr: String!, pwd: String!): String!
    }

    type ListItem {
        id: ID!
        message: String!
        isDone: Boolean!
        createdAt: String!
        assignee: User
    }

    type User {
        id: ID!
        name: String!
    }

    enum ORDERBY {
        asc
        desc
    }
`;

module.exports = typeDefs;