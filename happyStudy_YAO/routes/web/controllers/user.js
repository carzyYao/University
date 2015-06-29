var mysql = require('mysql');
var DATABASE = 'yao';
var TABLE ='teach_material_problem';

var connection = mysql.createConnection(
	{
	  host:'localhost',
	  user:'root',
	  password:'hokkaidou',
	  database: DATABASE
	}
);

exports.getlogin = function(req, res) {
	if(req.method == "GET"){
		res.render ('login',{
			title: 'Login Page',
			user: req.user,
			premonition:'',
			//message: req.session.messages
		})
		//console.log("session:" + req.session.messages + "user" + req.user);
	}
	else if(req.method == "POST"){	

		connection.query('SELECT * FROM user WHERE username=?;', [req.body.username] , function(err, results, fields){
			if(err) throw err;

			if(results == ''){
				res.render ('login',{
					title: 'Login Page',
					user: req.user,
					premonition:"您的帳號或密碼找不到或者是錯誤"
				})
			}else {
				var user = results;
				//密碼的判斷
				
				if(user[0].password == req.body.password){
					console.log(user[0].first_name + user[0].last_name +" 成功登入");

					req.session.user = user[0].username;
					req.session.uid = user[0].uid;
					console.log("使用者uid名稱 " + req.session.uid);
					res.redirect('/index');

				}
					
				else {
					res.render ('login',{
						title: 'Login Page',
						user: req.user,
						premonition:"您的帳號或密碼找不到或者是錯誤"
					})
				}
			}
		
		});

		console.log("this is post method");
		console.log("uid:" + req.body.username);
		console.log("password:" + req.body.password);
	}
	
}

exports.getlogout = function(req, res) {
	req.session.user = null;
	req.session.uid = null;
	//req.flash('success','登出成功');
	res.redirect('/login');

}


/*
exports.postlogin = function (req, res, next) {
	passport.authenticate("local", function (err, user, info) {
		if (err) {
			return next(err);
		}
		if (user) {
			req.session.messages = [info.message]
			return res.redirect("/login")
		}
		req.logIn user, (err) ->
			return next(err)  if err
			res.redirect "/"
	})(req, res, next);

}
	

exports.logout = (req, res) 
	req.logout()
	res.redirect "/login"


exports.list = function(req, res){

	connection.query('SELECT * FROM teach_material_problem;',  function(err, results, fields){
		if(err) throw err;
		console.log(results);
		
		res.render('users', { title: 'EEEE', name: 'sdfsdfsdf', q_content: results[0].q_content });
		connection.end();
	})

	
};
*/