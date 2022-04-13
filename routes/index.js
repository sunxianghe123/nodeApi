var express = require('express');
var router = express.Router();
var dbConfig = require('../util/dbconfig');

/* GET home page. */
router.get('/', function(req, res, next) {
  var sql = "select * from cate";
  var sqlArr = [];
  var callback = (err, data) => {
    if(err) {
      console.log('连接出错了');
    } else {
      res.send({
        'list': data,
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback);

  // res.render('index', { title: 'Express' });
});



module.exports = router;
