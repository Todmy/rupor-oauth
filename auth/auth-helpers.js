const querystring = require('querystring');

const config = require('../config').fbApp;

module.exports = {
    getTokenExchangeUrl,
    getUserInfoUrl,
    authGuard
};

function getTokenExchangeUrl(redirectUrl, code) {
    const fbExchangeEndpoint = 'https://graph.facebook.com/v2.8/oauth/access_token';
    const exchangeOptions = {
        client_id: config.clientID,
        client_secret: config.clientSecret,
        code
    };

    return `${fbExchangeEndpoint}?${querystring.stringify(exchangeOptions)}&redirect_uri=${redirectUrl}`
}

function getUserInfoUrl(access_token) {
    const fbUserInfoEndpoint = 'https://graph.facebook.com/v2.8/me';
    let fields = 'first_name,last_name,email';
    const userInfoOptions = {
        redirect: false,
        format: 'json',
        fields,
        access_token
    };

    return `${fbUserInfoEndpoint}?${querystring.stringify(userInfoOptions)}`;
}

function authGuard(req, res, next) {
    if(!req.session || !req.session.user) {
        return res.status(401).send('Unauthorized')
    }

    next();
}