var express = require('express');
var router = express.Router();
var User = require('../controllers/UserController');

/* GET users listing. */
router.get('/getCurrentUserInfo', User.getCurrentUserInfo);
router.post('/postRegister', User.postRegister);
router.post('/login', User.login);
router.post('/editUserInfo', User.editUserInfo);
router.post('/insertUserInfo', User.insertUserInfo);
router.post('/setPassword', User.setPassword);
router.post('/logout', User.logout);

module.exports = router;
