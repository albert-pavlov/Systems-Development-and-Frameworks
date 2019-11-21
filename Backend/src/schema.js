const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        getAllListItems(isDone: Boolean, orderBy: ORDERBY): [ListItem]
    }

    type Mutation {
        createListItem(message: String!): ListItem
        finishListItem(id: Int!): ListItem
        deleteListItem(id: Int!): ListItem
    }

    type ListItem {
        id: Int
        message: String
        isDone: Boolean
        createdAt: String
    }

    enum ORDERBY {
        asc
        desc
    }
`;

module.exports = typeDefs;