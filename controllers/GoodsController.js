const dbConfig = require("../util/dbconfig");
const moment = require("moment");

let getCount = (table_name) => {
  let sql = `select count(*) from ${table_name}`;
  let sqlArr = [];
  return dbConfig.SySqlConnect(sql, sqlArr);
}

// 获取表中数据条数（已完成）
let getCountArr = async (req, res) => {
  try {
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

/**
 * 获取商品信息接口
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
let getGoodsList = async (req, res, next) => {
  // id, user_id, category_id, title, description, price, stock, cover, pics, details, sales, is_on, is_recommend, created_at

  let {title, description, price, stock, sales, is_on, is_recommend} = req.query;
  let sql = `select * from goods`;
  let sqlArr = [];
  if (title || description || price || stock || sales || is_on || is_recommend) {
    sql = `select * from goods where title=? or description=? or price=? or stock=? or sales=? or is_on=? or is_recommend=?`;
    sqlArr = [title, description, price, stock, sales, is_on, is_recommend];
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
 * 通过商品名获取商品
 * @param description
 * @param callback
 * @returns {Promise<unknown | void>}
 */
let getCurrentGood = (description, callback) => {
  callback = callback || null;
  let sql = `select * from goods where description=? or id=?`;
  let sqlArr = [description, description];
  return dbConfig.SySqlConnect(sql, sqlArr, callback);
}

/**
 * 新建商品接口
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let addGoods = async (req, res) => {
  let {user_id, category_id, title, description, price, stock, cover, pics, details, sales} = req.body;
  // 检测用户是否存在
  let created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let name = await getCurrentGood(description);
  let count = (await getCount('goods'))[0]['count(*)'];
  let id = count + 1;
  if (!name[0]) {
    let sql = `insert into goods(id, user_id, category_id, title, description, price, stock, cover, pics, details, sales, created_at) value(?,?,?,?,?,?,?,?,?,?,?,?)`;
    let sqlArr = [id, user_id, category_id, title, description, price, stock, cover, pics, details, sales, created_at];
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
  } else {
    res.send({
      'msg': '商品已存在',
      'code': 403,
    })
  }
}


/**
 * 修改用户详细信息
 */
let setGoodInfo = async (id, user_id, category_id, title, description, price, stock, cover, pics, details, sales, created_at) => {
  console.log(id, user_id, category_id, title, description, price, stock, cover, pics, details, sales, created_at)
  let sqlArr = [user_id, category_id, title, description, price, stock, cover, pics, details, sales, created_at, id];
  let sql = `update goods set user_id=?,category_id=?,title=?,description=?,price=?,stock=?,cover=?,pics=?,details=?,sales=?,created_at=? where id=? `;
  let res = await dbConfig.SySqlConnect(sql, sqlArr);
  if (res.affectedRows == 1) {
    return await getCurrentGood(id);
  }
}

/**
 * 修改资料
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let editGoodInfo = async (req, res) => {
  let {id, user_id, category_id, title, description, price, stock, cover, pics, details, sales, created_at} = req.body;
  created_at = created_at || moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  price = Number(price);
  stock = Number(stock);
  let data = await setGoodInfo(id, user_id, category_id, title, description, price, stock, cover, pics, details, sales, created_at);
  if (data?.length) {
    res.send({
      code: 200,
      data: data[0]
    })
  } else {
    res.send({
      code: 400,
      msg: '修改失败'
    })
  }
}

/**
 * 改变商品上架状态
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const changeGoodOn = async (req, res) => {
  let {id, is_on} = req.query;
  let sql = `update goods set is_on=? where id=?`;
  let sqlArr = [is_on, id];
  let result = await dbConfig.SySqlConnect(sql, sqlArr);
  if (result.affectedRows) {
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
/**
 * 改变商品推荐状态
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const changeGoodRecommend = async (req, res) => {
  let {id, is_recommend} = req.query;
  let sql = `update goods set is_recommend=? where id=?`;
  let sqlArr = [is_recommend, id];
  let result = await dbConfig.SySqlConnect(sql, sqlArr);
  if (result.affectedRows) {
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

/**
 * 获取当前商品信息
 * @param req
 * @param res
 */
let getCurrentGoodInfo = (req, res) => {
  let {id} = req.query;
  let sql = `select id, user_id, category_id, title, description, price, stock, cover, pics, details, sales, created_at from goods where id=?`;
  let sqlArr = [id];
  let callback = (err, data) => {
    // console.log(data)
    if (err) {
      console.log(err);
      res.send({
        'err': err,
        'msg': '出错了',
        'code': 400,
      })
    } else if (data == '') {
      res.send({
        'msg': '商品不存在',
        'code': 400,
      })
    } else {
      res.send({
        'list': data,
        'msg': 'ok',
        'code': 200,
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback);
}

module.exports = {
  getCountArr,
  getGoodsList,
  addGoods,
  editGoodInfo,
  changeGoodOn,
  changeGoodRecommend,
  getCurrentGoodInfo
}