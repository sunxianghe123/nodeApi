var express = require('express');
var router = express.Router();
var Cart = require('../controllers/CartController');

/* GET users listing. */
router.get('/getCartList', Cart.getCartList);
router.get('/addToCart', Cart.addToCart);


module.exports = router;
