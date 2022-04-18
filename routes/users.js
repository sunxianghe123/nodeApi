var express = require('express');
var router = express.Router();
var User = require('../controllers/UserController');

/* GET users listing. */
router.post('/sendCode', User.sendCode);
router.post('/codePhoneLogin', User.codePhoneLogin);
router.get('/getUserInfo', User.getUserInfo);
router.post('/postRegister', User.postRegister);

module.exports = router;
