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
let getCartList = async (req, res, next) => {
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
  let {user_id, goods_id, num, is_checked, updated_at} = req.body;
  let sql = "", sqlArr = [];
  // 检测用户是否存在
  let created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let count = (await getCount('cart'))[0]['count(*)'];
  let hasNum = (await getCount('cart', goods_id))[0]['count(*)'];
  if(!user_id) {
    user_id = 1;
  }
  console.log(hasNum, 'hasNum');
  if (hasNum) {
    num = hasNum + num;
    sql = `update cart set num=? where goods_id=?`;
    sqlArr = [num, goods_id];
  } else {
    let id = count + 1;
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


/**
 * 修改用户详细信息
 */
let setSlideInfo = async (id, title, img, url, status, seq, created_at) => {
  let sqlArr = [title, img, url, status, seq, created_at, id];
  let sql = `update slides set title=?,img=?,url=?,status=?,seq=?,created_at=? where id=? `;
  let res = await dbConfig.SySqlConnect(sql, sqlArr);
  if (res.affectedRows == 1) {
    return await getCurrentSlide(id);
  }
}

/**
 * 修改轮播图
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let editSlideInfo = async (req, res) => {
  let {id, title, img, url, status, seq, created_at} = req.body;
  created_at = created_at ? moment(created_at).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let data = await setSlideInfo(id, title, img, url, status, seq, created_at);
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
 * 改变轮播图禁用状态
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const changeSlideStatus = async (req, res) => {
  let {id, status} = req.query;
  let sql = `update slides set status=? where id=?`;
  let sqlArr = [status, id];
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
 * 获取当前轮播图信息
 * @param req
 * @param res
 */
let getCurrentSlideInfo = (req, res) => {
  let {id} = req.query;
  let sql = `select id, title, img, url, status, seq, created_at from slides where id=?`;
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
        'msg': '轮播图不存在',
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
  getCartList,
  addToCart,
  editSlideInfo,
  changeSlideStatus,
  getCurrentSlideInfo
}