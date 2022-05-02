const dbConfig = require("../util/dbconfig");

/**
 * 修改资料
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
let editUserInfo = async (req, res) => {
  let {user_id, path, birthday, age, job, phone} = req.query;
  let sql = '';
  let sqlArr = [];
  if(path) {
    sql = `update user_info set path=? where user_id=? `;
    sqlArr = [path, user_id];
  }
  if(birthday) {
    sql = `update user_info set birthday=? where user_id=? `;
    sqlArr = [birthday, user_id];
  }
  if(age) {
    sql = `update user_info set age=? where user_id=? `;
    sqlArr = [age, user_id];
  }
  if(job) {
    sql = `update user_info set job=? where user_id=? `;
    sqlArr = [job, user_id];
  }
  if(phone) {
    sql = `update user_info set phone=? where user_id=? `;
    sqlArr = [phone, user_id];
  }
  let callback = (err, data) => {
    if (err) {
      console.log(err);
      res.send({
        'err': err,
        'msg': '修改失败',
        'code': 400,
      })
    } else {
      res.send({
        'list': data,
        'msg': '修改成功',
        'code': 200,
      })
    }
  }
  dbConfig.sqlConnect(sql, sqlArr, callback);
}

module.exports = {
  editUserInfo,
}