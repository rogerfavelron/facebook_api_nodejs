const jwt = require('jsonwebtoken');

const issueJWT = (user) => {
    const _id = user._id;
    const expiresIn = "1d";

    const payload = {
        _id: _id,
        iat: Date.now(),
    };
    const signedToken = jwt.sign(payload, process.env.SECRET, {
        expiresIn: expiresIn,
    });

    return {
        token: "Bearer " + signedToken,
        expires: expiresIn
    }

};
module.exports= issueJWT;
