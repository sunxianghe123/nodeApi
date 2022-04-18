// 获取分类
const dbConfig = require("../util/dbconfig");

/**
 *
 * @param req
 * @param res
 * @param next
 * 直接请求此接口 http://localhost:3000/
 */
getCate = (req, res, next) => {
  var sql = "select * from cate";
  var sqlArr = [];
  var callback = (err, data) => {
    if (err) {
      console.log('连接出错了');
    } else {
      res.send({
        'list': data,
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback);
}

// 获取指定分类的文章列表
/**
 *
 * @param req
 * @param res
 * @param next
 * 直接请求此接口 http://localhost:3000/getPostCate?id=1
 */
getPostCate = (req, res, next) => {
  let {id} = req.query;
  var sql = 'select * from post where cate_id=?';
  var sqlArr = [id];
  var callback = (err, data) => {
    if (err) {
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
  getCate,
  getPostCate,
}

