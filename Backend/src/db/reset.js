// https://github.com/Human-Connection/Human-Connection/blob/cf7b5851c3ceedd5fd932f9c475ef152be1b9249/backend/src/seed/reset-db.js

const { getDriver } = require("./neo4j");

const cleanDatabase = async (options = {}) => {
    const { driver = getDriver() } = options
    const cypher = 'MATCH (n) DETACH DELETE n'
    const session = driver.session()
    try {
      return await session.run(cypher)
    } finally {
      session.close()
    }
  }


;(async function() {
    try {
      await cleanDatabase()
      console.log('\nSuccessfully deleted all nodes and relations!\n')
      process.exit(0)
    } catch (err) {
      console.log(`Error occurred deleting the nodes and relations (reset the db)\n\n${err}`) 
      process.exit(1)
    }
  })()
