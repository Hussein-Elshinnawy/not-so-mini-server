const { expressjwt: expressJwt } = require('express-jwt');

function authJwt() {
    const secret = process.env.TOKENSECRET;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked,
    }).unless({
        path:[
            {url: /\/images\/upload(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/product(.*)/ , method:['GET', 'OPTIONS']},
            {url: /\/api\/v1\/category(.*)/ , methods: ['GET', 'OPTIONS'] },
            '/api/v1/user/login',
            '/api/v1/user/register',
        ]
    });
}

async function isRevoked(req, token) {
    if (!token.payload.isAdmin) {
        return true; 
    }
    return false; 
}


module.exports = authJwt;
