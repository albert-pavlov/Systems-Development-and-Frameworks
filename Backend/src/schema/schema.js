const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
       getJahr(number: Int!, userId: ID!): Jahr!
       getProfile(userId: ID!): User
    }

    type Mutation {
        createUser(name: String!, pwd: String!, wage: Int!): User
        login(usr: String!, pwd: String!): [String!] # token and IDs
        setWorkAndDuration(work: String!, duration: Int!, userId: ID!): String!
        #setWorkAndDuration(date: String!, work: String!, duration: Int!, userId: ID!): String!
    }

    type Jahr {
       number: Int!
       months: [Monat]
    }

    type Monat {
       number: Int!
       days: [Tag]
    }

    type Tag {
        day: Int!
        work: String!
        duration: Int!
    }

    type User {
        id: ID!
        name: String!
        wage: Int!
    }
`;

module.exports = typeDefs;