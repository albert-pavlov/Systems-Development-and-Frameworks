const { getServer } = require('./servers/servers');

getServer().listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});