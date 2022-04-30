var express = require('express');
var router = express.Router();
var Slides = require('../controllers/SlidesController');

/* GET users listing. */
router.get('/getSlidesList', Slides.getSlidesList);
router.post('/addSlides', Slides.addSlides);
router.post('/editSlideInfo', Slides.editSlideInfo);
router.get('/changeSlideStatus', Slides.changeSlideStatus);
router.get('/getCurrentSlideInfo', Slides.getCurrentSlideInfo);


module.exports = router;
