const dbConfig = require("../util/dbconfig");
const moment = require("moment");

let getCount = (table_name, goods_id) => {
  let sql = `select count(*) from ${table_name}`;
  let sqlArr = [];
  if (goods_id) {
    sql = `select count(*) from ${table_name} where goods_id=?`;
    sqlArr = [goods_id];
  }
  return dbConfig.SySqlConnect(sql, sqlArr);
}

/**
 * 获取购物车信息接口
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
let getCartList = (req, res, next) => {
  // id, user_id, goods_id, num, is_checked, created_at, updated_at

  let {id, user_id, goods_id, num, is_checked, created_at, updated_at} = req.query;
  let sql = `select * from cart`;
  let sqlArr = [];
  if (num) {
    sql = `select * from cart where num=?`;
    sqlArr = [num];
  }
  let callback = (err, data) => {
    if (err) {
      res.send({
        'err': err,
        'msg': '查询失败',
        'code': 400,
      })
    } else {
      data.forEach(item => {
        item['created_at'] = moment(item['created_at']).format('YYYY-MM-DD HH:mm:ss');
      })
      res.send({
        data,
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback);
}

/**
 * 查看之前购物车中是否有这件商品
 * @param goods_id
 * @param callback
 * @returns {Promise<unknown | void>}
 */
let searchCart = (goods_id, callback) => {
  callback = callback || null;
  let sql = `select * from cart where goods_id=?`;
  let sqlArr = [goods_id, goods_id];
  return dbConfig.SySqlConnect(sql, sqlArr, callback);
}

/**
 * 添加到购物车接口
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let addToCart = async (req, res) => {
  let {user_id, goods_id, num, is_checked, updated_at} = req.query;
  let sql = "", sqlArr = [];
  // 检测用户是否存在
  let created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let count = (await getCount('cart'))[0]['count(*)'];
  let hasNum = (await getCount('cart', goods_id))[0]['count(*)'];
  let goodNum = (await searchCart(goods_id))[0]?.num;
  if(!user_id) {
    user_id = 1;
  }
  console.log(hasNum, 'hasNum');
  if (hasNum) {
    num = goodNum + 1;
    sql = `update cart set num=? where goods_id=?`;
    sqlArr = [num, goods_id];
  } else {
    let id = count + 1;
    num = 1;
    sql = `insert into cart(id, user_id, goods_id, num, is_checked, created_at, updated_at) value (?,?,?,?,?,?,?)`;
    sqlArr = [id, user_id, goods_id, num, is_checked, created_at, updated_at];
  }
  let callback = (err, data) => {
    if (err) {
      console.log(err);
      res.send({
        'err': err,
        'msg': '添加失败',
        'code': 400,
      })
    } else {
      res.send({
        'list': data,
        'msg': '添加成功',
        'code': 200,
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback);
}







module.exports = {
  getCartList,
  addToCart,
}