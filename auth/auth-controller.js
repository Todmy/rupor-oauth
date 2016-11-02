const querystring = require('querystring');
const Promise = require('bluebird');
const request = Promise.promisify(require('request'));

const config = require('../config').fbApp;
const FbUser = require('./facebook-user-model');

const getTokenExchangeUrl = (redirectUrl, code) => {
    const fbExchangeEndpoint = 'https://graph.facebook.com/v2.8/oauth/access_token';
    const exchangeOptions = {
        client_id: config.clientID,
        client_secret: config.clientSecret,
        code
    };

    return `${fbExchangeEndpoint}?${querystring.stringify(exchangeOptions)}&redirect_uri=${redirectUrl}`
};

const getUserInfoUrl = (access_token) => {
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

class AuthController {
    validateRequest(req, res, next) {
        if(!req.body.code) {
            return res.status(400).send({message: 'Code is required for authorization;'});
        }

        next();
    }

    initSession(req, res) {
        const {provider, code} = req.body;
        const redirectUrl = req.protocol + '://' + req.get('host') + '/redirect.html'; //
        const reqTokenExchangeUrl = getTokenExchangeUrl(redirectUrl, code);

        return this.exchangeCodeToToken(reqTokenExchangeUrl)
            .then(this.getFacebookUserInfo.bind(this))
            .then(this.getDbUser.bind(this))
            .then(this.loginUser.bind(this, res))
            .catch(this.handleSessionErrors.bind(this, res));
    }
    
    exchangeCodeToToken(exchangeUrl) {
        return request(exchangeUrl)
            .then(this.handleFBResponse);
    }

    getFacebookUserInfo(authTokenObject) {
        const userInfoUrl = getUserInfoUrl(authTokenObject.access_token);

        return request(userInfoUrl)
            .then(this.handleFBResponse);
    }

    handleFBResponse(response) {
        if (response.statusCode == 200) {
            return JSON.parse(response.body);
        }

        return Promise.reject(JSON.parse(response.body));
    }

    getDbUser(fbUser) {
        return this.findFbUserInDB(fbUser.id)
            .then(this.createFbUser.bind(this, fbUser));
    }

    findFbUserInDB(id) {
        return FbUser.findOne({ id })
    }

    createFbUser(fbUser, dbUser) {
        if(dbUser) {
            return dbUser;
        }

        const user = new FbUser(fbUser);

        return user.save();
    }

    loginUser(res, user) {
        // TODO: add login logic
        res.status(200).send(user);
    }

    handleSessionErrors(res, error) {
        res.status(500).send(error);
    }
}

module.exports = new AuthController();