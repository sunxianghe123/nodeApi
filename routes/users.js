var express = require('express');
var router = express.Router();
var User = require('../controllers/UserController');

/* GET users listing. */
router.get('/getUserInfo', User.getUserInfo);
router.post('/postRegister', User.postRegister);
router.get('/login', User.login);
router.post('/editUserInfo', User.editUserInfo);
router.post('/insertUserInfo', User.insertUserInfo);
router.post('/setPassword', User.setPassword);
router.get('/logout', User.logout);

module.exports = router;
