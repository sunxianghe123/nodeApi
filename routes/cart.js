var express = require('express');
var router = express.Router();
var Cart = require('../controllers/CartController');

/* GET users listing. */
router.get('/getCartList', Cart.getCartList);
router.post('/addToCart', Cart.addToCart);
router.post('/editSlideInfo', Cart.editSlideInfo);
router.get('/changeSlideStatus', Cart.changeSlideStatus);
router.get('/getCurrentSlideInfo', Cart.getCurrentSlideInfo);


module.exports = router;
