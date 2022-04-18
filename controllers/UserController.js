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
codePhoneLogin = (req, res) => {
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
module.exports = {
  sendCode,
  codePhoneLogin
}