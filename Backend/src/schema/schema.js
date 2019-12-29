const { gql } = require('apollo-server');

const typeDefs = gql`
    type Query {
       getJahr(number: Int!, userId: ID!): Jahr!
       getProfile(userId: ID!): User
    }

    type Mutation {
        #only for self
        setWorkAndDuration(work: String!, duration: Int!, userId: ID!): String! #confirmation or error message
        
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
        id: ID!
        firstname: String!
        lastname: String!
        wage: Int! #Stundentlohn //Euro pro Std 10
        age: Int!
        maritalStatus: String!
    }
`;

module.exports = typeDefs;