const { rule, and, or, not, shield } = require('graphql-shield');
const jwtService = require('../jwt/service');

const isAuthenticated = rule()(async (parent, args, context, info) => {
  var valid = false;
  try{
	  var payload = jwtService.verify(context.token);
	  valid = payload != null;
  }
  catch(err){
	  console.log(err);
  }
  return valid;
})

const permissions = shield({
    Query: {
        getAllListItems
    },
    Mutation: {
        createListItem: isAuthenticated,
        finishListItem: isAuthenticated,
        deleteListItem: isAuthenticated,
        createAssignee: isAuthenticated
    }
})

module.exports = permissions;