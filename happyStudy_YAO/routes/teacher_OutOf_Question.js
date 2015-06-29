var mysql = require('mysql');
var DATABASE = 'yao';
//var TABLE ='teach_material_problem';

var connection = mysql.createConnection(
	{
	  host:'localhost',
	  user:'root',
	  password:'hokkaidou',
	  database: DATABASE
	}
);

function rChange(r, qua, finalR){
	for (var i = 0; i < r.length; i++){ 
        var rRand = Math.floor(Math.random() * r.length);
        var tempR = r[rRand];
        r[rRand] =r[i];
        r[i] = tempR;
    }
    for(var i = 0; i < qua; i++){
    	finalR.push(r[i]);
    }
}

function createTD(tempdata){
	var eid = tempdata.eid;
	var title = tempdata.title;
	var s_dt = tempdata.s_dt;
	var g_dt = tempdata.g_dt; 
	var q_l0 = tempdata.q_l0;
	var q_l1 = tempdata.q_l1;
	var q_l2 = tempdata.q_l2;
	var q_l3 = tempdata.q_l3;
	var lTotal = [];
	connection.query('SELECT * FROM teach_material_problem where q_level=0;', function(err, ql0data, fields){
		rChange(ql0data,q_l0,lTotal);
		connection.query('SELECT * FROM teach_material_problem where q_level=1;', function(err, ql1data, fields){
			rChange(ql1data,q_l1,lTotal);
			connection.query('SELECT * FROM teach_material_problem where q_level=2;', function(err, ql2data, fields){
				rChange(ql2data,q_l2,lTotal);
				connection.query('SELECT * FROM teach_material_problem where q_level=3;', function(err, ql3data, fields){
					rChange(ql3data,q_l3,lTotal);
					console.log(lTotal);
					
					post = {
						eid : eid,
						content : JSON.stringify(lTotal)

					}

					connection.query('INSERT INTO `tempData` SET ?', post, function(error, result){
						console.log(result.insertId)
					    if(error){
					        console.log('寫入資料失敗！');
					        throw error;
					    } else {
					    	console.log('tempData create successful！');
					    }
					});

				});
			});
		});
	});

}

function getQuestionTotal(cb){
	var sum;
	connection.query('SELECT * FROM teach_material_problem;', function(err, results, fields){
		if(err) throw err;
		sum = results.length;
		cb(sum);
	});
}

function getQuestionLevel(level, cb){
	var sum;
	connection.query('SELECT * FROM teach_material_problem where q_level=?', level, function(err, results, fields){
		if(err) throw err;
		sum = results.length;
		cb(sum);
	});
}
exports.list = function(req, res){
	if (req.method == "GET") {
		if(req.query.search == "outOfQues"){
			console.log( req.session.user + "進入老師出題頁面" );
			var quesTionTotal;		var quesTionLevel0;		var quesTionLevel1;		var quesTionLevel2;
			var quesTionLevel3;

			//取得題數總數
			getQuestionTotal( function(sum){
				quesTionTotal = sum;
				//取得難度0得題數
				getQuestionLevel('0', function(sum){
					quesTionLevel0 = sum;
					console.log("總題數" + quesTionTotal + "難度0題數" + quesTionLevel0);
					//取得難度1得題數
					getQuestionLevel('1', function(sum){
						quesTionLevel1 = sum;
						console.log("難度1題數" + quesTionLevel1);
						//取得難度2得題數
						getQuestionLevel('2', function(sum){
							quesTionLevel2 = sum;
							console.log("難度2題數" + quesTionLevel2);
							//取得難度3得題數
							getQuestionLevel('3', function(sum){
								quesTionLevel3 = sum;
								console.log("難度3題數" + quesTionLevel3);
								var data = {
									title:"老師出題",
									q_total: quesTionTotal,
									q_level0: quesTionLevel0,
									q_level1: quesTionLevel1,
									q_level2: quesTionLevel2,
									q_level3: quesTionLevel3
								}
								res.render('teacher_OutOf_Question', data);
							});
						});
					});
				});
			});
		}else{
	    	connection.query('SELECT * FROM exam', function(err, results, fields){
				if(err) throw err;
				data = results;
				res.render('tTextWall', data);
				console.log(data);
	    	});
		}
		
	}

	else if (req.method == "POST") {
		req.session.teacher_OutOf_Question_time = new Date().getTime();
		//console.log(req.session.teacher_OutOf_Question_time);
		var deadline1 = req.body.question_deadline1;
		var deadline2 = req.body.question_deadline2;
		var deadline = deadline1 + " " + deadline2;
		var dl = new Date(deadline).getTime();
		var post = {
			title : req.body.question_name,
			s_dt : req.session.teacher_OutOf_Question_time,
			g_dt : dl,
			q_l0 : req.body.q_level0,
			q_l1 : req.body.q_level1,
			q_l2 : req.body.q_level2,
			q_l3 : req.body.q_level3

		}
		connection.query('INSERT INTO `exam` SET ?', post, function(error, result){
			console.log(result.insertId)
		    if(error){
		        console.log('寫入資料失敗！');
		        throw error;
		    } else {
		    	console.log('老師出題 successful！');
		    	connection.query('SELECT * FROM exam WHERE eid=?', [result.insertId], function(err, results, fields){
					if(err) throw err;
					data = results;
					res.render('tTextWall', data);
					createTD(data[0]);
		    	});
		    }
		});

	} else {
	}
};