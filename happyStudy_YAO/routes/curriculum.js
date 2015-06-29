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

function getUserData(uid, user, callback){
	//查詢user資料表資料
	connection.query('SELECT * FROM user where username=?;', user ,  function(err, user, fields){
		if(err) throw err;
		//查詢user下student
		connection.query('SELECT * FROM student where uid=?;', uid ,  function(err, student, fields){
			if(err) throw err;

			callback(user, student);
		});
	});
}

function currSet(req,res,userUid,studentSid,userSession,eleData,couDatas,callback){
	var dataString = [];
	var dataBox = [];
	
	//新增一個 5*8 的二維陣列
	for(var i = 0; i < 5; i++){
		dataBox.push([]);
		console.log(dataBox);
		for(var j = 0; j < 8; j++){
			dataBox[i].push([""]);
		}
	}



	//把"選課資料"資料儲存並整理到dataString
	for(var i = 0;i < eleData.length; i++){
		dataString.push(
			[
				userSession,userUid,studentSid,eleData[i].eid,couDatas[i].cid,couDatas[i].tid,
				couDatas[i].day,couDatas[i].s_section,couDatas[i].g_section,
				couDatas[i].c_name
			]);
	}

	for(var i = 0;i < eleData.length; i++){
		for(var j = 0;j < 5; j++){
			//如果找到此day
			if(j+1 == dataString[i][6]){
				for(var k = 1;k <= 8; k++){
					if(k >= dataString[i][7] && k <= dataString[i][8]){
						//給予欄位科目名稱
						dataBox[j][k-1] = dataString[i][9] ;
						console.log("KKKKKKKKKKKK" + k);
					}
				}
			}	
		}
	}
	callback(dataBox,dataString);
}

function getElectiveData(sid, callback){
	connection.query('SELECT * FROM elective where sid=?', sid , function(err, eleData, fields){
		if(err) throw err;

		callback(eleData);
	});
}

function getCouDatas(eleData ,callback){
	var cids = [];
	var wheres = [];
	eleData.forEach(function(eleData) {
		cids.push(eleData.cid);
		wheres.push('?');
	});
	console.log("cids:::: " + cids);
	//[1, 2, 3].join(',')  -> "1,2,3"
	connection.query('SELECT * FROM course where cid in (' + wheres.join(',') + ') ORDER BY day ASC,s_section ASC', cids, function(err, couDatas, fields){
		if(err) throw err;

		callback(couDatas);
	});
	
	
}

//此區域參數有sid,username
function dataProcess(req,res,userUid,studentSid,userSession){
	var eleData;//選課資料
	var couDatas = [];//課程資料,一個學生會有多筆選課資料
	var data;

	//取得選課資料
	getElectiveData(studentSid, function(eleData){
		eleData = eleData;
		console.log("eleData::::");console.log(eleData);

		//取得課程資料
		getCouDatas(eleData, function(couDatas){
			couDatas = couDatas;
			console.log("couDatas::::");console.log(couDatas);

			currSet(req,res,userUid,studentSid,userSession,eleData,couDatas,function(dataBox,dataString){
				data = {
					title:"curriculum",
					ds: dataBox
				}

				console.log(userSession + "'s ds 課表資料為:: ");
				res.render('curriculum' , data);
			});

		});
		
	});
		

}

exports.look = function(req, res) {
	var userSession;
	var userName;
	var studentSid;
	var userUid;


	if (!req.session.user) {
		res.redirect('/login');
		return;
	}

	getUserData(req.session.uid, req.session.user, function(user, student) {

		userName = user[0].first_name + user[0].last_name;
		studentSid = student[0].sid;
		userUid = student[0].uid;

		console.log("使用者 " + userName + " 進入觀看課表頁面");
		console.log("使用者studentSid " + studentSid);
		console.log("使用者userUid " + userUid);

		if (req.method == "GET") {
			//userSession 就是學號,帳號名稱
			userSession = req.session.user;
			console.log("此觀看的session是 " + req.session.user);

			dataProcess(req,res,userUid,studentSid,userSession);

		}
	});


}