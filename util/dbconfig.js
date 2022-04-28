const mysql = require('mysql');
module.exports = {
  // 数据库配置
  config: {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'mall_backstage',
  },
  // 连接数据库，使用mysql的连接池方式连接
  // 连接池对象
  sqlConnect: function (sql, sqlArr, callback) {
    var pool = mysql.createPool(this.config);
    pool.getConnection((err,conn)=>{
      // console.log(pool);
      if(err) {
        console.log(err);
        console.log('连接失败');
        return;
      }
      // 事件驱动回调
      conn.query(sql, sqlArr, callback);
      // 释放连接
      conn.release();
    })
  },

  //promise 回调
  SySqlConnect:function(sySql,sqlArr){
    return new Promise((resolve,reject)=>{
      var pool = mysql.createPool(this.config);
      pool.getConnection(function(err,conn){
        if(err){
          reject(err);
        }else{
          conn.query(sySql,sqlArr,(err,data)=>{
            if(err){
              reject(err)
            }else{
              resolve(data);
            }
            conn.release();
          });
        }

      })
    }).catch((err)=>{
      console.log(err);
    })
  }
}