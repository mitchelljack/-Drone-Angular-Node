var express = require('express');
var session = require('express-session');
var router = express.Router();
var cloudant = require("../config/db");

router.post('/login', function(req, res) {
	if(req.body.username !=null && req.body.password!=null){
		// if(req.body.username == "admin" && req.body.password == "admin") {
		// 		req.session.user = req.body.username;
		// 		res.send('success');
		// } else {
				var operators = cloudant.db.use('operators');
				operators.view('get','login',{key:req.body.username},function(error,data){
						if(error){
								res.sendStatus(500);
						}
						else{
								if(data.rows[0] && data.rows[0].value.password==req.body.password)
								{
										// if(data.rows[0].value.type=="Pilot in Charge")
										// 		res.send("error")
										// else {
												req.session.user = req.body.username;
												req.session.type = data.rows[0].value.operator;
												res.send({result:true, data: data.rows[0].value.operator});
										// }
								}
								else{
									res.send("error");
								}
						}
				});
		//}
		// var users = cloudant.db.use('users');
		// users.view('get','username',{key:req.body.username},function(err,data){
		// 	if(err){
		// 		res.send("error");
		// 	}
		// 	else{
		// 			if(data.rows[0] && data.rows[0].value.password==req.body.password)
		// 			{
		// 					if(data.rows[0].value.type=="Pilot in Charge")
		// 							res.send("error")
		// 					else {
		// 							req.session.user = req.body.username;
		// 							res.send("success");
		// 					}
		// 			}
		// 			else{
		// 				res.send("error");
		// 			}
		// 	}
		// });
	}
	else{
		res.send("error");
	}
});


router.get('/profile',function(req,res){
	if(req.session && req.session.user){
		// if(req.session.user=='admin'){
		// 	res.send({"name":"admin","email":"admin@admin","croppedDataUrl":"images/manager2.png"});
		// }
		// else{
				var operators = cloudant.db.use('operators');
				operators.view('get','login',{key:req.session.user},function(error,data){
						if(error){
								res.sendStatus(500);
						}
						else{
								if(data.rows.length>0)
									res.send(data.rows[0].value);
								else{
									res.sendStatus(500);
								}
						}
				});
//		}
	}
	else{
		res.sendStatus(500);
	}
});

router.get('/reset/verify/:token',function(req,res){
		reset = cloudant.db.use('reset');
		reset.view('get','token',{key:req.params.token},function(error,data){
				if(error)
					res.send("error");
				else{
					if(data.rows[0] && data.rows[0].value){
						req.session.user = data.rows[0].value;
						console.log(req.session.user);
						res.redirect('/reset.html');
					}
					else{res.send('error')}
				}
		});
});



router.post('/reset/change',function(req,res){
	cloudant.db.list(function (err, allDbs) {
		if (err) {
			res.send("failed to connect");
		}
		else {
			if(req.body.password && req.session && req.session.user){
				username = req.session.user;
				var operators = cloudant.db.use('operators');
				operators.view('get','login',{key:req.session.user},function(error,data){
						if(error){
								res.sendStatus(500);
						}
						else{
								if(data.rows[0] && data.rows[0].value)
								{
										var user = data.rows[0].value;
										user.password = req.body.password;
										console.log(user);
										operators.insert(user,function(error,data){
											if(error)
												res.send(error);
											else{
												res.send('success');
											}
										})
								}
								else{
									res.send("error");
								}
						}
				});
			}
			else{
				res.send("no passwrod error");
			}
		}
	});
});

router.get('/reset/add/:email',function(req,res){
	if(req.params.email){
		reset = cloudant.db.use('reset');
		require('crypto').randomBytes(48, function(err, buffer) {
			var token = buffer.toString('hex');
			reset.insert({"email":req.params.email,"token":token},function(error,body){
			});

			var helper = require('sendgrid').mail

			from_email = new helper.Email("no-reply@precision-autonomy.mybluemix.com");
			to_email = new helper.Email(req.params.email);
			subject = "Reset Password";
			content = new helper.Content("text/html", "Please igonore if you have not applied for password reset <br> Click on the link to reset password https://precision-autonomy.mybluemix.net/users/reset/verify/"+token);
			mail = new helper.Mail(from_email, subject, to_email, content)

			var sg = require('sendgrid')('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');
			var request = sg.emptyRequest({
				method: 'POST',
				path: '/v3/mail/send',
				body: mail.toJSON()
			});

			sg.API(request, function(error, response) {
				if(response.statusCode == 202 || response.statusCode<=200)
					res.send("success");
				else{
					res.send("error");
				}
			})

		});
	}
	else{
		res.send("error");
	}
});

router.post("/signup",function(req,res){
		cloudant.db.list(function(err, allDbs) {
			if(err){
				res.send("failed to connect");
			}
			else if(req.body.email && req.body.password && req.body.operator) {
				var today = new Date();
				var years = today.getFullYear();
				var months = today.getMonth();
				var days = today.getDate();
				var date = Date.UTC(years, months, days);
				var args = req.body;
				args.username = req.body.email
				args.date = date;
				var operators = cloudant.db.use('operators');
				args.croppedDataUrl = "http://res.cloudinary.com/precision-autonomy/image/upload/v1482837551/default-user_q6ovge.png";
				operators.insert(args, function(err, body, header) {
						if (err) {
								res.send("error");
						}
						// req.session.user = req.body.email;
						// req.session.type = req.body.operator;
						var helper = require('sendgrid').mail

						from_email = new helper.Email("support@precision-autonomy.com");
						to_email = new helper.Email(req.body.email);
						subject = "Account Created";
						content = new helper.Content("text/html", "Congratulation your Precision Autonomy Account has been created. Please contact us if you have any questions support@precision-autonomy.com");
						mail = new helper.Mail(from_email, subject, to_email, content)

						var sg = require('sendgrid')('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');
						var request = sg.emptyRequest({
							method: 'POST',
							path: '/v3/mail/send',
							body: mail.toJSON()
						});

						sg.API(request, function(error, response) {
							if(response.statusCode == 202 || response.statusCode<=200)
								res.send("success");
							else{
								res.send("error");
							}
						})
				});
			}
			else{
				res.send("error");
			}
		});
	});

router.get("/logout",function(req,res){
	req.session.destroy();
	res.redirect("/");
});

module.exports = router;
