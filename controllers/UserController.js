const dbConfig = require("../util/dbconfig");
const moment = require('moment')

/*// 获取用户信息接口
let getUserInfo = (req, res, next) => {
  let {username, password} = req.query;
  // let sql = 'select * from user_info where username=?';
  // let sqlArr = [username];
  let callback = (err, data) => {
    if (err) {
      res.send({
        'err': err,
        'msg': '注册失败',
        'code': 400,
      })
    } else {
      res.send({
        'list': data,
        'msg': '成功',
        'code': 200,
      })
    }
  }
  return getUser(username, callback);
  // dbConfig.sqlConnect(sql, sqlArr, callback);
}
*/
// 获取用户主表（已完成）
let getUser = (username, callback) => {
  callback = callback || null;
  let sql = `select * from user where id=? or phone=? or username=?`;
  let sqlArr = [username, username, username];
  return dbConfig.SySqlConnect(sql, sqlArr, callback);
}
// 获取用户表中数据条数（已完成）
let getUserCount = (table_name) => {
  let sql = `select count(*) from ${table_name}`;
  let sqlArr = [];
  return dbConfig.SySqlConnect(sql, sqlArr);
}

// 用户注册接口（已完成）
let postRegister = async (req, res) => {
  console.log(req.body);
  let {username, avatar, password, phone, email} = req.body;
  // 检测用户是否存在
  // let avatar = 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fblog%2F202103%2F18%2F20210318191428_03a54.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652859044&t=35c7a7402684b3fa0db4d33040c13f67';
  let create_time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  let user = await getUser(username);
  let count = (await getUserCount('user'))[0]['count(*)'];
  let id = count + 1;
  // console.log(user, 'user');
  // console.log(count, 'count');
  // let sql = null, sqlArr = null, callback = null;
  if (!user[0]) {
    let sql = `insert into user(id, username, avatar, password, phone, email, create_time) value(?,?,?,?,?,?,?)`;
    let sqlArr = [id, username, avatar, password, phone, email, create_time];
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
//获取注册用户的详情
let getUserInfo = (user_id) => {
  let sql = `select age,sex,job,path,birthday from user_info where user_id=?`;
  let sqlArr = [user_id];
  return dbConfig.SySqlConnect(sql, sqlArr);
}
//插入用户详细信息
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

//查看用户是否有详情信息
let findUserInfo = async (user_id) => {
  let sql = `select * from user_info where user_id=?`;
  let sqlArr = [user_id];
  let res = await dbConfig.SySqlConnect(sql, sqlArr);
  return !!res.length;
}

//修改用户详细信息
let setUserInfo = async (user_id, username, age, sex, job, path, birthday) => {
  console.log(user_id, username, age, sex, job, path, birthday);
  let hasUserInfo = await findUserInfo(user_id);
  let sqlArr = [username, age, sex, job, path, birthday, user_id];
  console.log(sqlArr, 'sqlArr');
  if (hasUserInfo) {
    let sql = `update user_info set username=?, age=?,sex=?,job=?,path=?,birthday=? where user_id=? `;
    let res = await dbConfig.SySqlConnect(sql, sqlArr);
    if (res.affectedRows == 1) {
      let user = await getUser(user_id);
      let user_info = await getUserInfo(user_id);
      user[0].user_info = user_info[0];
      return user;
    }
  } else {
    let sql = `insert into user_info (user_id,username,age,sex,job,path,birthday) values(?,?,?,?,?,?,?)`;
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

//修改用户名称
// mysql_affected_rows() 函数返回前一次 MySQL 操作所影响的记录行数。
let setUserName = async (user_id, username) => {
  let sql = `update user set username=? where id=?`;
  let sqlArr = [username, user_id];
  let res = await dbConfig.SySqlConnect(sql, sqlArr);
  return res.affectedRows == 1;
}

//用户名、手机号登录,手机号+密码，邮箱+密码，用户名+密码
let login = (req, res) => {
  let username = req.query.username,
      password = req.query.password;
  let phone = /^1\d{10}$/;
  let email = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
  if (phone.test(username)) {
    let sql = 'select * from user where phone=? and password=? or username=? and password=?';
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
    let sql = `select * from user where email=? and password=?`;
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
    let sql = `select * from user where username=? and password=?`;
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

//修改资料
let editUserInfo = async (req, res) => {
  let {user_id, username, age, sex, job, path, birthday} = req.body;
  let result = await setUserName(user_id, username);
  console.log(result);
  if (result) {
    let data = await setUserInfo(user_id, username, age, sex, job, path, birthday);
    console.log(data);
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
  } else {
    res.send({
      code: 400,
      msg: '修改失败'
    })
  }
}
//检查用户密码
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
//修改用户密码
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
//绑定用户邮箱接口
let bindEmail = async (req, res) => {
  let {user_id, email} = req.query;
  let sql = `update user set email=? where id=?`;
  let sqlArr = [email, user_id];
  let result = await dbConfig.SySqlConnect(sql, sqlArr);
  console.log(result);
  if (result.affectedRows == 1) {
    res.send({
      code: 200,
      msg: '邮箱绑定成功'
    })
  } else {
    res.send({
      code: 400,
      msg: '邮箱绑定失败'
    })
  }
}
//退出
let logout = (req, res) => {

  res.send({
    code: 200,
    msg: '退出登录'
  })
}


module.exports = {
  getUserInfo,
  postRegister,
  login,
  editUserInfo,
  insertUserInfo,
  setPassword,
  logout
}