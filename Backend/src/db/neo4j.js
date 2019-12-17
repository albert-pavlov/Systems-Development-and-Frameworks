require('dotenv').config();
const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } = process.env;
const neo4j = require('neo4j-driver')


let driver

function getDriver(options = {}) {
  const {
    uri = NEO4J_URI,
    username = NEO4J_USERNAME,
    password = NEO4J_PASSWORD,
  } = options
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
  }
  return driver
}

module.exports = getDriver;