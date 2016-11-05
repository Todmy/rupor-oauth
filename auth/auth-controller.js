const promisify = require('bluebird').promisify;
const request = promisify(require('request'));

const FacebookUserModel = require('./facebook-user-model');

const { getTokenExchangeUrl, getUserInfoUrl } = require('./auth-helpers');

class AuthController {
    validateRequest(req, res, next) {
        if(!req.body.code) {
            return res.status(400).send({message: 'Code is required for authorization;'});
        }

        next();
    }

    getToken(req, res, next) {
        const {code} = req.body;
        const redirectUrl = req.protocol + '://' + req.get('host') + '/redirect.html'; //
        const reqTokenExchangeUrl = getTokenExchangeUrl(redirectUrl, code);

        request(reqTokenExchangeUrl)
            .then((response) => {
                if (response.statusCode == 200) {
                    req.body.authTokenObject = JSON.parse(response.body);
                    return next();
                }

                return next(response.body);
            });
    }

    getUserInfo(req, res, next) {
        const authTokenObject = req.body.authTokenObject;
        const userInfoUrl = getUserInfoUrl(authTokenObject.access_token);

        return request(userInfoUrl)
            .then((response) => {
                if (response.statusCode == 200) {
                    req.body.userInfo = JSON.parse(response.body);
                    return next();
                }

                return next(response.body);
            });
    }

    getUserFromDb(req, res, next) {
        const userFromRequest = req.body.userInfo;
        const { id } = userFromRequest;

        return FacebookUserModel.findOne({ id })
            .then((foundedUser) => {
                req.body.user = foundedUser;
                return next();
            })
            .catch((err) => next(err));
    }

    createUserIfAbsent(req, res, next) {
        const userFromDb = req.body.user;
        const userInfo = req.body.userInfo;

        if(userFromDb) {
            return next();
        }

        FacebookUserModel.create(userInfo)
            .then((newUser) => {
                req.body.user = newUser;
                return next();
            })
            .catch((err) => next(err));
    }

    authorizeUser(req, res) {
        req.session.user = req.body.user;

        res.status(200).send(req.session.user);
    }

    logout(req, res) {
        if(req.session) {
            req.session.destroy();
        }
        res.redirect('/redirect.html');
    }
}

module.exports = new AuthController();