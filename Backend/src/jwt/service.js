const fs = require('fs');
const jwt = require('jsonwebtoken');

var privateKEY = fs.readFileSync('./src/jwt/private.key', 'utf8');
var publicKEY  = fs.readFileSync('./src/jwt/public.key', 'utf8');

module.exports = {
 sign: (payload, $Options) => {
  
  var signOptions = {
      issuer:  $Options.issuer,
      subject:  $Options.subject,
      audience:  $Options.audience,
      expiresIn:  "3h",
      algorithm:  "RS512"    
  };
  return jwt.sign(payload, privateKEY, signOptions);
},
/*
    let decodedToken = jwtService.decode(token).payload;
    let vOptions = {
        issuer: decodedToken.iss,
        subject: decodedToken.sub, 
        audience: decodedToken.aud
        }
*/
verify: (token, $Option) => {
    
  var verifyOptions = {
      issuer:  $Option.issuer,
      subject:  $Option.subject,
      audience:  $Option.audience,
      expiresIn:  "3h",
      algorithm:  ["RS512"]
  };
   try{
     return jwt.verify(token, publicKEY, verifyOptions);
   }catch (err){
     return false;
   }
},
 decode: (token) => {
    return jwt.decode(token, {complete: true});
 }
}