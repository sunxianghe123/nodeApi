var express = require('express');
var router = express.Router();
var foreUser = require('../controllers/ForegroundUser');

/* GET users listing. */
router.get('/editUserInfo', foreUser.editUserInfo);

module.exports = router;
