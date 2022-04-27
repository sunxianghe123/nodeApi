const dbConfig = require("../util/dbconfig");
const moment = require('moment')

// 获取用户主表（已完成）
let getUser = (username, callback) => {
  callback = callback || null;
  let sql = `select * from user where id=? or phone=? or username=?`;
  let sqlArr = [username, username, username];
  return dbConfig.SySqlConnect(sql, sqlArr, callback);
}

let getCount = (table_name) => {
  let sql = `select count(*) from ${table_name}`;
  let sqlArr = [];
  return dbConfig.SySqlConnect(sql, sqlArr);
}

// 获取用户表中数据条数（已完成）
let getCountArr = async (req, res) => {
  try{
    let usersCount = (await getCount('user'))[0]['count(*)'];
    let goodsCount = (await getCount('goods'))[0]['count(*)'];
    let ordersCount = (await getCount('orders'))[0]['count(*)'];
    res.send({
      'list': {users_count: usersCount, goods_count: goodsCount, orders_count: ordersCount},
      'msg': 'OK',
      'code': 200,
    })
  } catch (e) {
    res.send({
      'err': e,
      'msg': '数据表不存在',
      'code': 400,
    })
  }
}

module.exports = {
  getCountArr,
}