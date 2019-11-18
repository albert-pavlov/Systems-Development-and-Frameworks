const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
        getAllListItems(isDone: Boolean, orderBy: ORDERBY): [ListItem]
    }

    type ListItem {
        id: Int
        message: String
        isDone: Boolean
        createdAt: String
    }

    enum ORDERBY {
        ASC,
        DESC
    }
`;

module.exports = typeDefs;