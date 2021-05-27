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
  if(uri==undefined || username == undefined || password == undefined) {
    console.warn(`    
      This is a warning message. Apllication failed to start up.\n
      Neo4j URI, username and/or password are undefined. This is due to a missing environment file.\n
      Go to project root folder and create an .env file. Then put the missing key/value pairs inside, as follows:\n
      $cd Backend/\n
      $touch .env\n
      << open the .env file, enter the following three capitalized keys, and fill the values of the keys >>\n
      NEO4J_URI = Neo4j URI (suggestion: 'bolt://localhost:7687')\n
      NEO4J_USERNAME = Neo4j database name (suggestion: 'neo4j')\n
      NEO4J_PASSWORD = Neo4j database password (suggestion: 'password')\n\n`)
  }
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
  }
  return driver
}
function closeDriver() {
  driver.close();
}
module.exports = { getDriver, closeDriver };