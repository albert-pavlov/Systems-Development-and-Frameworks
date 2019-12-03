const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const permissions = require('./middleware/permissions');
const { makeExecutableSchema } = require('graphql-tools');
const { applyMiddleware } = require('graphql-middleware');

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers
});
const schemaWithMiddleware = applyMiddleware(schema, permissions);

function getServer() {
  const server = new ApolloServer({
    schema: schemaWithMiddleware, 
    context: ({req}) => {return {token: req.headers.authorization}}
  });
  return server;
}

function getTestServer(ctx) {
  const testServer = new ApolloServer({
    schema: schemaWithMiddleware, 
    context: ctx
  });
  return testServer;
}

module.exports = { getServer, getTestServer };