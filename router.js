const router = require('express').Router();

const { authRoutes, authGuard: isAuthorized } = require('./auth');

// ===== AUTH =====
router.use(authRoutes);

// ===== AUTH GUARD =====
router.use(isAuthorized);

// ===== API ROUTES =====
router.use('/api', function (req, res, next) {
    res.status(200).send('TEST');
});

// ===== ERROR HANDLER =====
router.use(function(err, req, res) {
    res.status(500).send(err);
});

module.exports = router;