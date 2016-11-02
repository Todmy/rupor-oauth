const router = require('express').Router();
const auth = require('./auth-controller');


router.route('/session')
    .post(auth.validateRequest, (...args) => { auth.initSession(...args); });

module.exports = router;