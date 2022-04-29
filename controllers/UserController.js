const dbConfig = require("../util/dbconfig");
const moment = require('moment')

const changeUserLocked = async (req, res) => {
  let {user_id, is_locked} = req.query;
  let sql = `update user_info set is_locked=? where user_id=?`;
  let sqlArr = [is_locked, user_id];
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
 * 获取表中数据总数
 * @param table_name
 * @returns {Promise<unknown | void>}
 */
let getCount = (table_name) => {
  let sql = `select count(*) from ${table_name}`;
  let sqlArr = [];
  return dbConfig.SySqlConnect(sql, sqlArr);
}

/**
 * 获取用户信息接口
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
let getUserList = async (req, res, next) => {
  let {username, email, count, per_page, current_page, total_pages, links_previous, links_next} = req.query;
  let total = (await getCount('user_info'))[0]['count(*)'];
  if (!per_page) per_page = 10;
  if (!current_page) current_page = 0;
  // let sql = `select * from user_info limit ${current_page*per_page},${per_page}`;
  let sql = `select * from user_info`;
  let sqlArr = [];
  if (username || email) {
    // sql = `select * from user_info where username=? or email=? limit ${current_page*per_page},${per_page}`;
    sql = `select * from user_info where username=? or email=?`;
    sqlArr = [username, email];
  }
  let callback = (err, data) => {
    // if(data.length) total = data.length;
    if (!count) count = (total > per_page) ? per_page : total;
    if (!total_pages) total_pages = Math.ceil(total / per_page);
    if (err) {
      res.send({
        'err': err,
        'msg': '查询失败',
        'code': 400,
      })
    } else {
      data.forEach(item => {
        item['created_at'] = moment(item['created_at']).format('YYYY-MM-DD HH:mm:ss');
        item['birthday'] = moment(item['birthday']).format('YYYY-MM-DD HH:mm:ss');
      })
      res.send({
        data,
        pagination: {
          total,
          count,
          per_page,
          current_page,
          total_pages,
          links_previous: links_previous,
          links_next: links_next,
        }
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback);
}
/**
 * 获取用户主表（已完成）
 * @param username
 * @param callback
 * @returns {Promise<unknown | void>}
 */
let getUser = (username, callback) => {
  callback = callback || null;
  let sql = `select * from user_info where user_id=? or phone=? or username=?`;
  let sqlArr = [username, username, username];
  return dbConfig.SySqlConnect(sql, sqlArr, callback);
}


/**
 * 用户注册接口（已完成）
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let postRegister = async (req, res) => {
  let {username, password, avatar, age, sex, job, path, birthday, email, phone} = req.body;
  // 检测用户是否存在
  let created_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let user = await getUser(username);
  let count = (await getCount('user_info'))[0]['count(*)'];
  let user_id = count + 1;
  if (!user[0]) {
    let sql = `insert into user_info(user_id, username, password, avatar, age, sex, job, path, birthday, email, phone, created_at) value(?,?,?,?,?,?,?,?,?,?,?,?)`;
    let sqlArr = [user_id, username, password, avatar, age, sex, job, path, birthday, email, phone, created_at];
    let callback = (err, data) => {
      if (err) {
        console.log(err);
        res.send({
          'err': err,
          'msg': '注册失败',
          'code': 400,
        })
      } else {
        res.send({
          'list': data,
          'msg': '注册成功',
          'code': 200,
        })
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, callback);
  } else {
    res.send({
      'msg': '用户已存在',
      'code': 403,
    })
  }
}


// TODO

/**
 * 获取当前用户信息
 * @param req
 * @param res
 */
let getCurrentUserInfo = (req, res) => {
  let {username, user_id} = req.query;
  let sql = `select username,avatar,age,sex,job,path,birthday,email,phone,is_locked,created_at from user_info where username=? or user_id=?`;
  let sqlArr = [username, user_id];
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
        'msg': '用户不存在',
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

/**
 * 获取注册用户的详情
 * @param user_id
 * @returns {Promise<unknown | void>}
 */
let getUserInfo = (user_id) => {
  let sql = `select age,sex,job,path,birthday from user_info where user_id=?`;
  let sqlArr = [user_id];
  return dbConfig.SySqlConnect(sql, sqlArr);
}

/**
 * 插入用户详细信息
 * @param req
 * @param res
 */
let insertUserInfo = (req, res) => {
  let {user_id, username, age, sex, job, path, birthday} = req.body;
  let sql = `insert into user_info(user_id, username, age, sex, job, path, birthday) values(?,?,?,?,?,?,?)`;
  let sqlArr = [user_id, username, age, sex, job, path, birthday];
  let callback = (err, data) => {
    if (err) {
      console.log(err);
      res.send({
        'err': err,
        'msg': '注册失败',
        'code': 400,
      })
    } else {
      res.send({
        'list': data,
        'msg': '注册成功',
        'code': 200,
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback);
}


/**
 * 查看用户是否有详情信息
 * @param user_id
 * @returns {Promise<boolean>}
 */
let findUserInfo = async (user_id) => {
  let sql = `select * from user_info where user_id=?`;
  let sqlArr = [user_id];
  let res = await dbConfig.SySqlConnect(sql, sqlArr);
  return !!res.length;
}

/**
 * 修改用户详细信息
 */
let setUserInfo = async (user_id, username, password, avatar, age, sex, job, path, birthday, email, phone) => {
  let hasUserInfo = await findUserInfo(user_id);
  let sqlArr = [username, password, avatar, age, sex, job, path, birthday, email, phone, user_id];
  if (hasUserInfo) {
    let sql = `update user_info set username=?,password=?,avatar=?,age=?,sex=?,job=?,path=?,birthday=?,email=? where user_id=? `;
    let res = await dbConfig.SySqlConnect(sql, sqlArr);
    if (res.affectedRows == 0) {
      let user = await getUser(user_id);
      let user_info = await getUserInfo(user_id);
      user[0].user_info = user_info[0];
      return user;
    }
  } else {
    let sql = `insert into user_info (user_id, username, password, avatar, age, sex, job, path, birthday, email, phone) values(?,?,?,?,?,?,?,?,?,?,?)`;
    // let sqlArr = [user_id, age, sex, job, path, birthday];
    let res = await dbConfig.SySqlConnect(sql, sqlArr);
    if (res.affectedRows == 1) {
      let user = await getUser(user_id);
      let user_info = await getUserInfo(user_id);
      user[0].user_info = user_info[0];
      return user;
    }
  }
}

/**
 * 修改资料
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let editUserInfo = async (req, res) => {
  let {user_id, username, password, avatar, age, sex, job, path, birthday, email, phone} = req.body;
  let data = await setUserInfo(user_id, username, password, avatar, age, sex, job, path, birthday, email, phone);
  if (data.length) {
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
 * 修改用户名称
 * @param user_id
 * @param username
 * @returns {Promise<boolean>}
 */
// mysql_affected_rows() 函数返回前一次 MySQL 操作所影响的记录行数。
// let setUserName = async (user_id, username) => {
//   let sql = `update user set username=? where id=?`;
//   let sqlArr = [username, user_id];
//   let res = await dbConfig.SySqlConnect(sql, sqlArr);
//   return res.affectedRows == 1;
// }

/**
 * 检查用户密码
 * @param user_id
 * @returns {Promise<number|*>}
 */
let checkUserPwd = async (user_id) => {
  let sql = `select password from user where id=?`;
  let sqlArr = [user_id];
  let res = await dbConfig.SySqlConnect(sql, sqlArr);
  if (res.length) {
    return res[0].password;
  } else {
    return 0;
  }
}

/**
 * 修改用户密码
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let setPassword = async (req, res) => {
  let {user_id, oldpassword, newpassword} = req.body;
  let userPwd = await checkUserPwd(user_id);
  if (userPwd) {
    if (userPwd == oldpassword) {
      let sql = `update user set password=? where id=?`;
      let sqlArr = [newpassword, user_id];
      let result = await dbConfig.SySqlConnect(sql, sqlArr);
      if (result.affectedRows) {
        res.send({
          code: 200,
          msg: '修改密码成功！'
        })
      } else {
        res.send({
          code: 400,
          msg: '修改密码失败！'
        })
      }
    } else {
      res.send({
        code: 400,
        msg: '原密码输入错误！'
      })
    }
  } else {
    let sql = `update user set password=? where id=?`;
    let sqlArr = [newpassword, user_id];
    let result = await dbConfig.SySqlConnect(sql, sqlArr);
    if (result.affectedRows) {
      res.send({
        code: 200,
        msg: '修改密码成功！'
      })
    } else {
      res.send({
        code: 400,
        msg: '修改密码失败！'
      })
    }
  }
}



/**
 * 登录
 * @param req
 * @param res
 */
//用户名、手机号登录,手机号+密码，邮箱+密码，用户名+密码
let login = (req, res) => {
  let username = req.body.username,
      password = req.body.password;
  let phone = /^1\d{10}$/;
  let email = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
  if (phone.test(username)) {
    let sql = 'select * from user_info where phone=? and password=? or username=? and password=?';
    let sqlArr = [username, password, username, password];
    let callBack = async (err, data) => {
      console.log(data);
      if (err) {
        console.log(err);
        res.send({
          code: 400,
          msg: '出错了'
        });
      } else if (data == '') {
        res.send({
          code: 400,
          msg: '用户名或者密码出错！'
        });
      } else {
        let user_id = data[0].id;
        let result = await getUserInfo(user_id);
        data[0].user_info = result[0];
        res.send({
          code: 200,
          msg: '登录成功',
          data: data[0]
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
  } else if (email.test(username)) {
    let sql = `select * from user_info where email=? and password=?`;
    let sqlArr = [username, password];
    let callBack = async (err, data) => {
      if (err) {
        console.log(err);
        res.send({
          code: 400,
          msg: '出错了'
        });
      } else if (data == '') {
        res.send({
          code: 400,
          msg: '用户名或者密码出错！'
        });
      } else {
        let user_id = data[0].id;
        let result = await getUserInfo(user_id);
        data[0].user_info = result[0];
        res.send({
          code: 200,
          msg: '登录成功',
          data: data[0]
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
  } else {
    let sql = `select * from user_info where username=? and password=?`;
    let sqlArr = [username, password];
    let callBack = async (err, data) => {
      if (err) {
        console.log(err);
        res.send({
          code: 400,
          msg: '出错了'
        });
      } else if (data == '') {
        res.send({
          code: 400,
          msg: '用户名或者密码出错！'
        });
      } else {
        let user_id = data[0].id;
        let result = await getUserInfo(user_id);
        data[0].user_info = result[0];
        res.send({
          code: 200,
          msg: '登录成功',
          data: data[0]
        });
      }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack);
  }
}

/**
 * 退出
 * @param req
 * @param res
 */
let logout = (req, res) => {
  res.send({
    data: {},
    success: true,
  })
}


module.exports = {
  changeUserLocked,
  getUserList,
  getCurrentUserInfo,
  postRegister,
  login,
  editUserInfo,
  insertUserInfo,
  setPassword,
  logout
}