const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        getOneListItem(id: ID!): ListItemInfo
        getAllListItems(isDone: Boolean, orderBy: ORDERBY): [ListItem]
    }

    type Mutation {
        createListItem(message: String!, assigneeID: ID): ListItem
        assignListItem(id: ID!, assigneeID: ID!): ListItem
        finishListItem(id: ID!): ListItemInfo
        deleteListItem(id: ID!): ListItemInfo
        createUser(name: String!, pwd: String!): UserInfo
        login(usr: String!, pwd: String!): String!
    }

    type ListItem {
        id: ID!
        message: String!
        isDone: Boolean!
        createdAt: String!
        assignee: User
    }

    type ListItemInfo {
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

    type UserInfo {
        id: ID!
        name: String!
    }

    enum ORDERBY {
        asc
        desc
    }
`;

module.exports = typeDefs;