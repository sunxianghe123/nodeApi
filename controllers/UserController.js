const dbConfig = require("../util/dbconfig");

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
  for(let item of validatePhoneCode) {
    if((phone == item.phone) && (code == item.code)) {
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
    if(status === 'login') {
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

// 获取用户信息接口
let getUserInfo = (req, res, next) =>{
  let {username, password} = req.query;
  let sql = 'select * from user_info where username=?';
  let sqlArr = [username];
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
  dbConfig.sqlConnect(sql, sqlArr, callback);
}

// 用户注册接口
let postRegister = async (req, res) =>{
  console.log(req.body);
  let {username, avatar, phone} = req.body;
  // 检测用户是否存在
  // let avatar = 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fblog%2F202103%2F18%2F20210318191428_03a54.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1652859044&t=35c7a7402684b3fa0db4d33040c13f67';
  let create_time = new Date().valueOf();
  let sql = `insert into user(username, avatar, phone, create_time) value(?,?,?,?)`;
  let sqlArr = [username, avatar, phone, create_time];
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


module.exports = {
  sendCode,
  codePhoneLogin,
  getUserInfo,
  postRegister
}