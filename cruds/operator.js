var express = require('express');
var router = express.Router();
var cloudant = require('../config/db');
var cloudinary = require('../config/cloudinary');


router.post('/create',function(req,res){
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
            args.date = date;
            var operators = cloudant.db.use('operators');
            var users = cloudant.db.use('users');
            users.view('get','username',{key:args.email},function(error,data){
                if(error){
                    res.sendStatus(500);
                }
                else if(!data.rows[0]){
                    users.insert({"username":args.email,"password":args.password,"type":args.operator,"email":args.email},function(error){
                        if(error)
                            res.send("error");
                        else{
														cloudinary.uploader.upload(args.croppedDataUrl, function(result) {
																args.croppedDataUrl = result.secure_url;
																operators.insert(args, function(err, body, header) {
		                                if (err) {
		                                    res.send("error");

		                                }
		                                res.send('success');
		                            });
														});

                        }
                    });
                }
                else{
                    res.sendStatus(500);
                }
            })

        }
        else{res.send("error");
			}
    });
});

router.post('/edit',function(req,res){
    cloudant.db.list(function(err, allDbs) {
        if(err){
            res.send("failed to connect");
        }
        else if(req.body._id && req.body.operator) {
            var today = new Date();
            var years = today.getFullYear();
            var months = today.getMonth();
            var days = today.getDate();
            var date = Date.UTC(years, months, days);
            var args = req.body;
            args.date = date;
            var operators = cloudant.db.use('operators');
            operators.get(req.body._id,{ revs_info: true },function(error,data) {
                if(error)
                    res.sendStatus(500);
                else{
                    args.email = data.email;
                    if(data.companyName)
                        args.companyName = data.companyName;

										if(args.croppedDataUrl.substring(0,5) == "https") {
												operators.insert(args,function(error,data){
														if(error)
																res.sendStatus(500);
														else
																res.send('success');
												});
										} else {
												cloudinary.uploader.upload(args.croppedDataUrl, function(result) {
														args.croppedDataUrl = result.secure_url;
														operators.insert(args,function(error,data){
				                        if(error)
				                            res.sendStatus(500);
				                        else
				                            res.send('success');
				                    });
												});
										}
                }
            })
        }
        else{res.send("error");}

    });
});

router.post('/delete',function(req,res){
    if(req.body.id && req.body.rev){
        var args = req.body;
        var operators = cloudant.db.use('operators');
        var users = cloudant.db.use('users');
        operators.destroy(req.body.id,req.body.rev,function(error){
            if(error)
                res.send("error");
            else{
                users.view('get','username',{key:args.email},function(error,data){
                    if(error || !data.rows[0])
                        res.sendStatus(500);
                    else{
                        var id = data.rows[0].value._id;
                        var rev = data.rows[0].value._rev;
                        console.log(data.rows[0].value);
                        users.destroy(id,rev,function(error){
                            if(error)
                                res.sendStatus(500);
                            else{
                                res.send("success");
                            }
                        })
                    }
                });
            }
        });

    }
    else{
        res.send("error");
    }
});

router.get("/checkEmail/:email", function(req, res) {
		var email = req.params.email;
		var operators = cloudant.db.use('operators');
		operators.view('get','login',{key:email},function(error,data){
				if(error){
						res.sendStatus(500);
				}
				else{
						if(data.rows[0] && data.rows[0].value)	{
								res.send("fail");
						}
						else {
							res.send("success");
						}
				}
		});
});

router.get("/fetch/pilots",function(req,res){
    cloudant.db.list(function(err,allDbs){
        if(err){
            res.send("error");
        }
        else{
            if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
                var operators = cloudant.db.use('operators');
                operators.view('get','pilots',function(err,data){
                    if(err){
                        res.send(err);
                    }
                    else{
                        res.send(data);
                    }
                });
            }
            else{
                var operators = cloudant.db.use('operators');
                operators.view('get','pilots',{key:req.session.user},function(err,data){
                    if(err){
                        res.send(err);
                    }
                    else{
                        res.send(data);
                    }
                });
            }
        }
    });
});

router.get("/fetch/all",function(req,res){
    cloudant.db.list(function(err,allDbs){
        if(err){
            res.send("error");
        }
        else{
            var operators = cloudant.db.use('operators');
            operators.view('get','all',function(err,data){
                if(err){
                    res.send(err);
                }
                else{
                    res.send(data);
                }
            });
        }
    });
});

router.get("/fetch/inventory",function(req,res){
    cloudant.db.list(function(err,allDbs){
        if(err){
            res.send("error");
        }
        else{
            if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
                var operators = cloudant.db.use('operators');
                operators.view('get','inventory',function(err,data){
                    if(err){
                        res.send(err);
                    }
                    else{
                        result = [];
                        for(var i in data.rows){
                            result.push(data.rows[i].value);
                        }
                        res.send(result);
                    }
                });
            }
            else{
                var operators = cloudant.db.use('operators');
                operators.view('get','operator',{key:req.session.user},function(err,data){
                    if(err){
                        res.send(err);
                    }
                    else{
                        result = [];
                        for(var i in data.rows){
                            result.push(data.rows[i].value);
                        }
                        res.send(result);
                    }
                });
            }
        }
    });
});

router.get('/fetch/date',function(req,res){
    cloudant.db.list(function(err, allDbs) {
        if(err){
            res.send("failed to connect");
        }
        else {
            if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
                var operators = cloudant.db.use('operators');
                operators.view('get','date',function(error,data){
                    if(error)
                        res.send("error");
                    else{
                        var result = {};
                        for(var i in data.rows){
                            if(result[data.rows[i].value])
                            {
                                result[data.rows[i].value] +=1;
                            }
                            else{
                                result[data.rows[i].value] =1;
                            }
                        }
                        var response = [];
                        for(var i in result)
                        {
                            response.push([i,result[i]]);
                        }
                        res.send(response);
                    }
                });
            }
            else{
                var operators = cloudant.db.use('operators');
                operators.view('get','date',function(error,data){
                    if(error)
                        res.send("error");
                    else{
                        var result = {};
                        for(var i in data.rows){
                            if(result[data.rows[i],{key:req.session.user}.value])
                            {
                                result[data.rows[i].value] +=1;
                            }
                            else{
                                result[data.rows[i].value] =1;
                            }
                        }
                        var response = [];
                        for(var i in result)
                        {
                            response.push([i,result[i]]);
                        }
                        res.send(response);
                    }
                });
            }
        }

    });
});

router.get('/fetch/one/:id',function(req,res){
    if(req.params.id){
        var id = req.params.id;
        var operators = cloudant.db.use('operators');
        operators.get(id,{ revs_info: true },function(error,data){
            if(error)
                res.sendStatus(404);
            else{
                res.send(data);
            }
        });
    }
    else
        res.sendStatus(400);
});

module.exports = router;
