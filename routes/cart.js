var express = require('express');
var router = express.Router();
var Cart = require('../controllers/CartController');

/* GET users listing. */
router.get('/getCartList', Cart.getCartList);
router.post('/addToCart', Cart.addToCart);
router.get('/changeGoodChecked', Cart.changeGoodChecked);
router.get('/deleteGoodInCart', Cart.deleteGoodInCart);


module.exports = router;
