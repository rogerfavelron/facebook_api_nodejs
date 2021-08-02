const jwt = require('jsonwebtoken');
const ExtractJwt = require('passport-jwt').ExtractJwt;

//the thing this function does is that it copied user into req.payload. 
const getTokenData = (req,res,next)=>{
    if(!req.user){
        const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
        const payload = jwt.verify(jwtFromRequest(req), process.env.SECRET);
        req.payload = payload;
    }
    else{
        req.payload = req.user;
    }
    next();
}
module.exports = getTokenData;