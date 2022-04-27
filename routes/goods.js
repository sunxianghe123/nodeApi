var express = require('express');
var router = express.Router();
var Goods = require('../controllers/GoodsController');

/* GET users listing. */
router.get('/getCountArr', Goods.getCountArr);
// router.post('/postRegister', Goods.postRegister);


module.exports = router;
