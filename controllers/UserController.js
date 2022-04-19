const dbConfig = require("../util/dbconfig");
const moment = require('moment')


function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

let validatePhoneCode = [];
let sendCodeP = (phone) => {
  for (let item of validatePhoneCode) {
    if (phone === item.phone) {
      return true;
    }
  }
  return false;
}
let findCodeAndPhone = (phone, code) => {
  for (let item of validatePhoneCode) {
    if ((phone == item.phone) && (code == item.code)) {
      return 'login';
    }
  }
  return 'error';
}

//模拟发送验证码接口
// 这些 req,res函数是放到路由中用的，路由是express的路由，封装了req和res以及next
sendCode = (req, res, next) => {
  let phone = req.query.phone;
  if (sendCodeP(phone)) {
    res.send({
      'code': 400,
      'msg': '已经发送过验证码，稍后再发',
    })
  }
  let code = rand(1000, 9999);
  validatePhoneCode.push({
    'phone': phone,
    'code': code
  })
  console.log(validatePhoneCode);
  res.send({
    'code': 200,
    'msg': '发送成功',
  })
  console.log(code);
}

// 验证码登录接口
let codePhoneLogin = (req, res) => {
  let {phone, code} = req.query;
  // 验证该手机号是否发送过验证码
  if (sendCodeP(phone)) {
    // 验证码和手机号是否匹配
    let status = findCodeAndPhone(phone, code);
    if (status === 'login') {
      // 登录成功
      // 成功之后的操作
      res.send({
        'code': 200,
        'msg': '登录成功'
      })
    } else if (status === 'error') {
      res.send({
        'code': 200,
        'msg': '登录失败'
      })
    }
  } else {
    res.send({
      'code': 400,
      'msg': '未发送验证码'
    })
  }
}

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
let getUserCount = () => {
  let sql = `select count(*) from user`;
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
  let count = (await getUserCount())[0]['count(*)'];
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
  let sql = `select age,sex,job,path,birthday from userinfo where user_id=?`;
  let sqlArr = [user_id];
  return dbConfig.SySqlConnect(sql, sqlArr);
}
//创建副表
let createUserInfo = (user_id) => {
  let sql = `insert into userinfo(user_id,age,sex,job) values(?,?,?,?)`;
  let sqlArr = [user_id, 18, 2, '未设置'];
  return dbConfig.SySqlConnect(sql, sqlArr);
}

//查看用户是否有详情信息
let finUserInfo = async (user_id) => {
  let sql = `select * from userinfo where user_id=?`;
  let sqlArr = [user_id];
  let res = await dbConfig.SySqlConnect(sql, sqlArr);
  if (res.length) {
    return true;
  }
  return false;
}
//修改用户详细信息
let setUserInfo = async (user_id, age, sex, job, path, birthday) => {
  if (finUserInfo(user_id)) {
    let sql = `update userinfo  set age=?,sex=?,job=?,path=?,birthday=? where user_id=? `;
    let sqlArr = [age, sex, job, path, birthday, user_id]
    let res = await dbConfig.SySqlConnect(sql, sqlArr);
    if (res.affectedRows == 1) {
      let user = await getUser(user_id);
      let userinfo = await getUserInfo(user_id);
      user[0].userinfo = userinfo[0];
      return user;
    }
  } else {
    let sql = `insert into userinfo (user_id,age,sex,job,path,birthday) values(?,?,?,?,?,?)`;
    let sqlArr = [user_id, age, sex, job, path, birthday];
    let res = await dbConfig.SySqlConnect(sql, sqlArr);
    if (res.affectedRows == 1) {
      let user = await getUser(user_id);
      let userinfo = await getUserInfo(user_id);
      user[0].userinfo = userinfo[0];
      return user;
    }
  }
}

//修改用户名称
let setUserName = async (user_id, username) => {
  let sql = `update user set username=? where id=?`;
  let sqlArr = [username, user_id];
  let res = await dbConfig.SySqlConnect(sql, sqlArr);
  if (res.affectedRows == 1) {
    return true;
  } else {
    return false;
  }
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
        data[0].userinfo = result[0];
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
        data[0].userinfo = result[0];
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
        data[0].userinfo = result[0];
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
  let {user_id, username, age, sex, job, path, birthday} = req.query;
  let result = await setUserName(user_id, username);
  if (result) {
    let data = await setUserInfo(user_id, age, sex, job, path, birthday);
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
  console.log(res[0].password)
  if (res.length) {
    return res[0].password;
  } else {
    return 0;
  }
}
//修改用户密码
let setPassword = async (req, res) => {
  let {user_id, oldpassword, newpassword} = req.query;
  let userPwd = await checkUserPwd(user_id);
  if (userPwd) {
    console.log(userPwd, oldpassword)
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
  sendCode,
  codePhoneLogin,
  getUserInfo,
  postRegister
}