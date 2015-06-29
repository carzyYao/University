
/**
 * Module dependencies.模版依賴關係
 */

var express 				= require('express');
var http 					= require('http');
var path 					= require('path');
var fs 						= require('fs');
var passport				= require('passport');
//var form = require('connect-form');

var index					= require('./routes/index');
var user					= require('./routes/web/controllers/user');
var question 				= require('./routes/question');
var teacher_OutOf_Question 	= require('./routes/teacher_OutOf_Question');
var leave 					= require('./routes/leave');
var curriculum				= require('./routes/curriculum');
var app 					= express();

var test 					= require('./routes/test');

app.use(express.cookieParser());
app.use(express.bodyParser());
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.session({ secret: 'doveserver dev' }))
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only 開發
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/proFile', test.proFile);

app.get('/leave', leave.list);
app.post('/leave', leave.list);
app.get('/login', user.getlogin);
app.get('/logout', user.getlogout);
app.post('/login', user.getlogin);

app.get('/index', index.list);
app.get('/questionBoard',question.questionBoard);
app.get('/question',question.enterExam);
app.get('/checkRecord',question.checkRecord);
app.get('/curriculum',curriculum.look);
app.post('/question', question.enterExam);//處理測驗的表單
app.get('/teacher_OutOf_Question',teacher_OutOf_Question.list);
app.post('/teacher_OutOf_Question',teacher_OutOf_Question.list);

// 傾聽 + 顯示連線port


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

