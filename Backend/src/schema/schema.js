const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
       getJahr(number: Int!, userId: Int!): Jahr!
       getProfile(userId: Int!): User
    }

    type Mutation {

        setWorkAndDuration(work: String!, duration: Int!): String! #confirmation or error message
        login(usr: String!, pwd: String!): [String!] # token and IDs
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
        number: Int!
        work: String
        duration: Int
    }

    type User {
        firstname: String!
        lastname: String!
        wage: Int! #Stundentlohn
        age: Int!
        maritalStatus: String!
    }
`;

module.exports = typeDefs;