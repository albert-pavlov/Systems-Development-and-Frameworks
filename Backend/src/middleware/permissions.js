const { rule, deny, allow, shield } = require('graphql-shield');
const jwtService = require('../jwt/service');

const isAuthenticated = rule({ cache: 'contextual' })(
    async (parent, args, ctx, info) => {
        try{
            let decodedToken = jwtService.decode(ctx.token);
            if (decodedToken == null || decodedToken == undefined) {
                return false;
            }
            let vOptions = {
                issuer: decodedToken.payload.iss,
                subject: decodedToken.payload.sub, 
                audience: decodedToken.payload.aud
                }
            
            return jwtService.verify(ctx.token, vOptions) != null;
        }
        catch(err){
            console.log(err);
        }
        return false;
    }
  )

  const isOwner = rule({ cache: 'no_cache'})(
    async (parent, args, ctx, info) => {
        try{
            let decodedToken = jwtService.decode(ctx.token);
            if (decodedToken == null || decodedToken == undefined) {
                return false;
            }
            return decodedToken.payload.sub === parent.assignee.name;
        }
        catch(err){
            console.log(err);
        }
        return false;
    }
  )

  const isSelf = rule({ cache: 'no_cache'})(
    async (parent, args, ctx, info) => {
        try{
            let decodedToken = jwtService.decode(ctx.token);
            if (decodedToken == null || decodedToken == undefined) {
                return false;
            }
            return decodedToken.payload.sub === parent.name;
        }
        catch(err){
            console.log(err);
        }
        return false;
    }
  )

const permissions = shield({
    Query: {
        "*": deny,
        getAllListItems: isAuthenticated
    },
    Mutation: {
        "*": deny,
        login: allow,
        createUser: allow,
        createListItem: isAuthenticated,
        assignListItem: isAuthenticated,
        finishListItem: isAuthenticated,
        deleteListItem: isAuthenticated        
    },
    ListItemInfo: isOwner,
    User: isSelf
})

module.exports = permissions;