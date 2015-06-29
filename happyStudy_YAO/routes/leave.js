var fs = require('fs');
var mysql = require('mysql');
var DATABASE = 'yao';
var TABLE ='teach_material_problem';

var att,stu,stuCour,teac,clasmat,user;


var connection = mysql.createConnection(
	{
	  host:'localhost',
	  user:'root',
	  password:'hokkaidou',
	  database: DATABASE
	}
);

connection.query('SELECT * FROM attendance;',  function(err, results, fields){
	if(err) throw err;
	att = results;

});

// connection.query('SELECT * FROM student_course;',  function(err, results, fields){
// 	if(err) throw err;
// 	stuCour = results;

// });

// connection.query('SELECT * FROM student;',  function(err, results, fields){
// 	if(err) throw err;
// 	stu = results;

// });

connection.query('SELECT * FROM teacher;',  function(err, results, fields){
	if(err) throw err;
	teac = results;

});

connection.query('SELECT * FROM user;',  function(err, results, fields){
	if(err) throw err;
	user = results;

});

exports.list = function(req, res, next){
	if(req.method == "GET"){

		var data = { title: 'leave', name: 'null', att: att[0],clasmat:clasmat[0] ,user:user[0]};
		res.render('leave', data);	
	}
	else if(req.method == "POST"){
		
		//上傳檔案
		//並且判斷是否有檔案上傳
		if(req.files.leaveFile.originalFilename !=''){

			var uploadedFile = req.files.leaveFile;
		    var tmpPath = uploadedFile.path;
		    var targetPath = './file/' + uploadedFile.name;		//檔案路徑

		    fs.rename(tmpPath, targetPath, function(err) {
		        if (err) throw err;
		           fs.unlink(tmpPath, function() {
		           	
		               console.log('File Uploaded to ' + targetPath + ' - ' + uploadedFile.size + ' bytes');
		               console.log(targetPath);
		        });
		    });
			res.send('file upload is done.');

			connection.query('INSERT INTO leaves values(?,?,?,?,?)', [null,att[0].aid,req.body.leaveReason,targetPath,null], function(err, result) {
				if (err) throw err;
				console.log(result.insertId);
			});
			res.end();
		}

		else
			res.send("你沒有上傳證明文件");
		
	}	
  	else{}
};