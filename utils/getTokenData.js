const jwt = require('jsonwebtoken');
const ExtractJwt = require('passport-jwt').ExtractJwt;

//the thing this function does is that it copied user into req.payload. 
const getTokenData = (req,res,next)=>{
    if(!req.user){
        console.log("no user found trafalgar law")
        const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
        const payload = jwt.verify(jwtFromRequest(req), process.env.SECRET);
        req.payload = payload;
    }
    else{
        console.log("user is actually found, dofffy")
        req.payload = req.user;
    }
    next();
}
module.exports = getTokenData;