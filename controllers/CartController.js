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
  if (user_id) {
    sql = `select * from cart where user_id=?`;
    sqlArr = [user_id];
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
  let {user_id, goods_id, num, image, title, description, price, is_checked, updated_at} = req.body;
  let sql = "", sqlArr = [];
  // 检测用户是否存在
  let created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let count = (await getCount('cart'))[0]['count(*)'];
  let hasNum = (await getCount('cart', goods_id))[0]['count(*)'];
  let goodNum = (await searchCart(goods_id))[0]?.num;
  if(!user_id) {
    user_id = 1;
  }
  user_id = Number(user_id);
  console.log(hasNum, 'hasNum');
  if (hasNum) {
    num = goodNum + 1;
    sql = `update cart set num=?, image=?, title=?, description=?, price=? where goods_id=?`;
    sqlArr = [num, image, title, description, price, goods_id];
  } else {
    let id = count + 1;
    num = 1;
    console.log(user_id, 'user_id')
    sql = `insert into cart(id, user_id, goods_id, num, image, title, description, price, is_checked, created_at, updated_at) value (?,?,?,?,?,?,?,?,?,?,?)`;
    sqlArr = [id, user_id, goods_id, num, image, title, description, price, is_checked, created_at, updated_at];
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

const changeGoodChecked = async (req, res) => {
  let {id, is_checked} = req.query;
  let sql = `update cart set is_checked=? where id=?`;
  let sqlArr = [is_checked, id];
  let result = await dbConfig.SySqlConnect(sql, sqlArr);
  if (result?.affectedRows) {
    res.send({
      code: 200,
      msg: '操作成功！'
    })
  } else {
    res.send({
      code: 400,
      msg: '操作失败！'
    })
  }
}

const deleteGoodInCart = async (req, res) => {
  let {user_id, goods_id} = req.query;
  let sql = `delete from cart where user_id=? and goods_id=?`;
  let sqlArr = [user_id, goods_id];
  let result = await dbConfig.SySqlConnect(sql, sqlArr);
  console.log(result);
  if (result?.affectedRows) {
    res.send({
      code: 200,
      msg: '操作成功！'
    })
  } else {
    res.send({
      code: 400,
      msg: '操作失败！'
    })
  }
}



module.exports = {
  getCartList,
  addToCart,
  changeGoodChecked,
  deleteGoodInCart
}