const authRoutes = require('./auth-routes');
const { authGuard } = require('./auth-helpers');

module.exports = {
    authRoutes,
    authGuard
};