// 获取分类
const dbConfig = require("../util/dbconfig");

getCate = (req, res, next)=>{
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
}

module.exports = {
  getCate
}

