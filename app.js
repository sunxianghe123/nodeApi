// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
// const logger = require('morgan');
const bodyParser = require('body-parser');
// cors包用于实现跨域
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const goodsRouter = require('./routes/goods');

const app = express();

// 改写
const http = require('http');
const server = http.createServer(app);

// view engine setup 模板相关
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// 日志相关
// app.use(logger('dev'));
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 配置跨域
app.use(cors());
// app.use(function(req,res,next){
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   res.header("Content-Type", "application/json;charset=utf-8");
//   res.header('Access-Control-Allow-Credentials','true');
//   next();
// });

// post请求
app.use(bodyParser.urlencoded({extended: true}));   // 进行url解码
app.use(bodyParser.json());   // 将数据转换成json格式

// 使用引入的路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/goods', goodsRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });


server.listen('3000');
// module.exports = app;
