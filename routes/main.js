const router = require("express").Router();

const admin_route = require('../routes/admin');
const user_route = require('../routes/user');

router.use('/admin', admin_route);
router.use('/user', user_route);

module.exports = router;