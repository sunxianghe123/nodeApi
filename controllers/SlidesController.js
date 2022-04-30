const dbConfig = require("../util/dbconfig");
const moment = require("moment");

let getCount = (table_name) => {
  let sql = `select count(*) from ${table_name}`;
  let sqlArr = [];
  return dbConfig.SySqlConnect(sql, sqlArr);
}

/**
 * 获取轮播图信息接口
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
let getSlidesList = async (req, res, next) => {
  // id, title, img, url, status, seq, created_at

  let {id, title, img, url, status, seq, created_at} = req.query;
  let sql = `select * from slides`;
  let sqlArr = [];
  if (title || status || seq) {
    sql = `select * from slides where title=? or status=? or seq=?`;
    sqlArr = [title, status, seq];
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
 * 通过轮播图名/id获取轮播图
 * @param description
 * @param callback
 * @returns {Promise<unknown | void>}
 */
let getCurrentSlide = (title, callback) => {
  callback = callback || null;
  let sql = `select * from slides where title=? or id=?`;
  let sqlArr = [title, title];
  return dbConfig.SySqlConnect(sql, sqlArr, callback);
}

/**
 * 新建轮播图接口
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let addSlides = async (req, res) => {
  let {title, img, url, status, seq} = req.body;
  // 检测用户是否存在
  let created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let name = await getCurrentSlide(title);
  let count = (await getCount('slides'))[0]['count(*)'];
  let id = count + 1;
  if (!name[0]) {
    let sql = `insert into slides(id, title, img, url, status, seq, created_at) value (?,?,?,?,?,?,?)`;
    let sqlArr = [id, title, img, url, status, seq, created_at];
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
      'msg': '轮播图已存在',
      'code': 403,
    })
  }
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
  getSlidesList,
  addSlides,
  editSlideInfo,
  changeSlideStatus,
  getCurrentSlideInfo
}