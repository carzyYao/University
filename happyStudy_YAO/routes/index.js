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

exports.list = function(req, res) {
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	
	
	

	connection.query('SELECT * FROM user where username=?;', req.session.user ,  function(err, results, fields){
		if(err) throw err;

		var data = {
			title: 'Sgate',
			user_name: results[0].first_name + results[0].last_name,
		};
		var username = results[0].username;

		if(username.match('student') != null){
			res.render('sindex', data);
			console.log( username + "進入sindex頁面" );
		}
		else if(username.match){
			res.render('tindex', data);
			console.log( username + "進入tindex頁面" );
		}
	});
}