const { ApolloServer } = require('apollo-server');
const typeDefs = require('../schema/schema');
const resolvers = require('../schema/resolvers');
const permissions = require('../middleware/permissions');
const { makeExecutableSchema } = require('graphql-tools');
const { applyMiddleware } = require('graphql-middleware');
const { getDriver } = require("../db/neo4j");

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers
});
const schemaWithMiddleware = applyMiddleware(schema, permissions);

const driver = getDriver();

function getServer() {
  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    context: ({ req }) => {
      return {
        driver: driver,
        token: req.headers.authorization
      }
    }
  });
  return server;
}

function getTestServer(ctx) {
  const testServer = new ApolloServer({
    schema: schemaWithMiddleware,
    context: {
      driver: driver,
      token: ctx
    }
  });
  return testServer;
}

module.exports = { getServer, getTestServer };