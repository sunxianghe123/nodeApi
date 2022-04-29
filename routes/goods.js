var express = require('express');
var router = express.Router();
var Goods = require('../controllers/GoodsController');

/* GET users listing. */
router.get('/getCountArr', Goods.getCountArr);
router.get('/getGoodsList', Goods.getGoodsList);
router.post('/addGoods', Goods.addGoods);
router.post('/editGoodInfo', Goods.editGoodInfo);
router.get('/changeGoodOn', Goods.changeGoodOn);
router.get('/changeGoodRecommend', Goods.changeGoodRecommend);
router.get('/getCurrentGoodInfo', Goods.getCurrentGoodInfo);


module.exports = router;
