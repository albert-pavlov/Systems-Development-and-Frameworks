const { getServer } = require('./servers');

getServer().listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});