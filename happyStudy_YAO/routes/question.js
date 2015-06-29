var mysql = require('mysql');
var DATABASE = 'yao';

var connection = mysql.createConnection(
	{
	  host:'localhost',
	  user:'root',
	  password:'hokkaidou',
	  database: DATABASE
	}
);

function dataProcess(req,res,userSession){

	//student當下選擇考試id
	var teid = req.query.teid;
	var qdata;
	var qQua;
	var newResults = [];
	var r = [];//處理完後的題目
	var answers =[];


	connection.query('SELECT * FROM tempData where eid=?;', [teid] ,  function(err, result, fields){

		if(err) throw err;
		//把results[0].content的內容轉換成物件(解析)
		result[0].content = JSON.parse(result[0].content); 
		//console.log(results[0].content);

		//把此測驗的題目放在data
		//把qdata[i].q_options的內容轉換成物件(解析)
		qdata = result[0].content;
		for(var i = 0; i < qdata.length; i++){
			qdata[i].q_options = JSON.parse(qdata[i].q_options);
		};
		
		//把r_temp放入r最後的題目陣列
		r = qdata;

		//選項跟者題目交換交換
		rChange(r);
		
		//隨機答案與選項，答案輸出到a[]
		oANDaChange(r, answers);
		req.session.answers = answers;

		connection.query('SELECT * FROM user where username=?;', userSession ,  function(err, result, fields){
			if(err) throw err;

			var data = { 
				title: '測驗',
				user_name: result[0].first_name + result[0].last_name,
				result: r,
				answer: answers, 
			};
			res.render('question', data);
		});
	});
}

//題目交換
function rChange(r){

	for (var i = 0; i < r.length; i++){ 
        var rRand = Math.floor(Math.random() * r.length);
        var tempR = r[rRand];
        r[rRand] =r[i];
        r[i] = tempR;
    }

}

//處理選項與答案的交換
function oANDaChange(r, answers){

	for (var i = 0; i < r.length; i++) {	
		var answerOption = [0, 1, 2]; //定義答案陣列位置
		
		var optLength = r[i].q_options.length;//options length
		//console.log(optLength);
		for (var j = 0; j < optLength; j++) {
			var optRand = Math.floor(Math.random() * optLength);

			var temp_opt = r[i].q_options[optRand]; //option change
			r[i].q_options[optRand] = r[i].q_options[j];  
			r[i].q_options[j] = temp_opt;

			var temp_answer = answerOption[optRand];//answer change
			answerOption[optRand] = answerOption[j];
			answerOption[j] = temp_answer;
		}
		for( var j = 0; j < optLength; j++){
			if (answerOption[j] == 0){
			  answers.push(j); //輸出答案的'所在位置'到總答案陣列裡
			  console.log("第 "+ (i+1) +"題-答案: " + answers[i] +",");
			}
		}
    }
    console.log("處理選項與答案的交換");
}

function getUserData(user, callback){

	connection.query('SELECT * FROM user where username=?;', user ,  function(err, results, fields){
		if(err) throw err;
		callback(results);
	});

}

function getExamData(eid, callback){

	connection.query('SELECT * FROM tempData where eid=?;', eid ,  function(err, tempData, fields){
		if(err) throw err;

		//把results[0].content的內容轉換成物件(解析)
		tempData[0].content = JSON.parse(tempData[0].content); 
		//console.log(results[0].content);

		if(tempData.length == 0){
			callback(null);
		} else {
			callback(tempData[0]);
		}		
	});
}

function getAllExam(callback){

	connection.query('SELECT * FROM tempData',  function(err, tempData, fields){
		if(err) throw err;

		//把tempData[i].content的內容轉換成物件(解析)
		if(tempData.length == 0){
				callback(null);
		} else{
			for(var i = 0; i < tempData.length; i++){
				tempData[i].content = JSON.parse(tempData[i].content); 
				//console.log(results[0].content);
			}
			callback(tempData);
		}
		
	});
}

function getExamTitle(eid, callback){

	connection.query('SELECT * FROM exam where eid=?;', eid ,  function(err, exam, fields){
		if(err) throw err;

		if(exam.length == 0){
			callback(null);
		}
		else {
			callback(exam[0].title);
		}		
	});
}


exports.enterExam = function(req, res){

	var userSession;
	var userName;

	if (!req.session.user) {
		res.redirect('/login');
		return;
	}

	//取得使用者資料,並且給予變數值
	getUserData(req.session.user, function(result) {

		userName = result[0].first_name + result[0].last_name;
		console.log("使用者 " + userName + " 轉換頁面");
	});

	//處理進入測驗頁面
	if (req.method == "GET") {

		//如果老師沒出題 送出老師尚未出題,反之執行問題交換
		getAllExam(function(exams){
			if (!exams){
				res.send("<div class ='well'>老師尚未出題</div>");
			} else {
				//給予Session值
				userSession = req.session.user;

				//測驗數量
				var examQuas;
				examQuas = exams.length;

				//給予開始時間
				req.session.s_Time = new Date().getTime();
				
				console.log("測驗數量:::" + examQuas);
				console.log("此測驗的session是 " + req.session.user);

				//進入題目資料處理
				dataProcess(req,res,userSession);
			}
		});		
	}

	//處裡分數評分與測驗結果
	else if (req.method == "POST") {

		var qQua;
		var userSessId = req.session.user;
			console.log("userSessId" + userSessId);
		var answers = req.session.answers;
		var teid = req.query.teid;
		getExamData(teid, function(exam){
			qQua = exam.content.length;

			console.log("題目數量:::" + qQua);

			req.session.e_Time = new Date().getTime() - req.session.s_Time;//給予考試經過時間
		
			//如果老師有出題數過來 給予變數值

			console.log("開始時間::" + req.session.s_Time + "經過時間::"+ req.session.e_Time/1000 +"秒");

			var weights = Math.floor(100/qQua);// the score's %
			var user_answer_string = [];
			var careString;
			var yes = 0;//question number of correct answers
			var score = 0;
			
			for (var i = 0; i < qQua; i++) {
				if(!req.body['question_' + (i + 1)]){
					user_answer_string.push('4');//when the user does not answer this question
				}
				else{
					user_answer_string.push(req.body['question_' + (i+1)]);
				}
				
				if(user_answer_string[i] == answers[i]){
					yes++;
				}
			}

			//分數處理
			if (yes == qQua) {
				score = 100;
				careString = "你太優秀了!";
			}
			else {
				score = yes * weights;
				careString = "再接再厲!";
			}

			//res.send("hi you are " + yes + " right<br>so you get " + score + " score!");

			connection.query('SELECT * FROM user where username=?;', req.session.user ,  function(err, result, fields){
				if(err) throw err;
				var data = {
					title: '測驗',
					user_name: result[0].first_name + result[0].last_name,
					yes: yes,
					score: score,
					allNum: qQua,
					careString: careString 
				};

				res.render('sumScore', data);
			});

			getExamTitle(teid, function(examTitle){
				//做資料庫寫入成績動作
				var post = {
					score: score,
					eid: teid,
					user_sess_id: userSessId,
					exam_title: examTitle,
					s_dt: req.session.s_Time,
					e_time: req.session.e_Time 
				};
				connection.query('INSERT INTO `exam_result` SET ?', post, function(error){

				    if(error){
				        console.log('寫入資料失敗！');
				        throw error;
				    }
				    else {
				    	console.log( req.session.user + ' exam_result reading successful！');
				    	req.session.answers = null;
				    }
				});
			});
		});
	} 
	else {
	}
};

exports.questionBoard = function(req, res){

	if (req.method == "GET") {
		connection.query('SELECT * FROM exam', function(err, results, fields){
			if(err) throw err;

			data = results;
			res.render('questionBoard', data);
			console.log(req.session.user + "點擊進入question.js 的檔案");
	    });
	}
	else {
	}
}

exports.checkRecord = function(req, res){

	
	var userSessId = req.session.user;
		console.log("userSessId::" + userSessId);

	connection.query('SELECT * FROM exam_result where user_sess_id=? ', userSessId, function(err, RecordDatas, fields){
		if(err) throw err;

		data = RecordDatas;
		res.render('checkRecord', data);
			console.log(req.session.user + "點擊進入checkRecord 的檔案")
		
	});

}