const router = require('express').Router();
const auth = require('./auth-controller');


router.route('/session')
    .post(auth.validateRequest, 
        auth.getToken, 
        auth.getUserInfo, 
        auth.getUserFromDb, 
        auth.createUserIfAbsent, 
        auth.authorizeUser);

router.route('/logout')
    .get(auth.logout);

module.exports = router;