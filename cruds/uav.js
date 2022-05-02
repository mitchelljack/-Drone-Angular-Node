var express = require('express');
var router = express.Router();
var cloudant = require('../config/db');
var cloudinary = require('../config/cloudinary');



router.post('/create',function(req,res){
	cloudant.db.list(function(err, allDbs) {
		if(err){
			res.send("failed to connect");
		}
		else {
			var today = new Date();
			var years = today.getFullYear();
			var months = today.getMonth();
			var days = today.getDate();
			var date = Date.UTC(years, months, days);
			var args = req.body;
			args.date = date;
			var uavs = cloudant.db.use('uavs');
			cloudinary.uploader.upload(args.image, function(result) {
					args.image = result.secure_url;
					uavs.insert(args, function(err, body, header) {
						if (err) {
							res.send("error");
						}
						res.send('success');
					});
			});
		}

	});
});


router.get('/fetch/one/:id',function(req,res){
	cloudant.db.list(function(err, allDbs) {
		if(err){
			res.send("failed to connect");
		}
		else {
			var uavs = cloudant.db.use('uavs');
			var args = req.params;
			uavs.get(req.params.id,{ revs_info: true },function(error,data) {
          if(error)
              res.sendStatus(500);
          else{
          	if(data){
          		res.send(data);
          	}
          	else{
          		res.sendStatus(404);
          	}

          }
      })
		}

	});
});

router.post('/edit',function(req,res){
	cloudant.db.list(function(err, allDbs) {
		if(err){
			res.send("failed to connect");
		}
		else {
			var today = new Date();
			var years = today.getFullYear();
			var months = today.getMonth();
			var days = today.getDate();
			var date = Date.UTC(years, months, days);
			var args = req.body;
			args.date = date;
			var uavs = cloudant.db.use('uavs');
			if(args.image.substring(0,5) == "https") {
					uavs.insert(args, function(err, body, header) {
						if (err) {
							res.send("error");
						}
						res.send('success');
					});
			} else {
					cloudinary.uploader.upload(args.image, function(result) {
							args.image = result.secure_url;
							uavs.insert(args, function(err, body, header) {
								if (err) {
									res.send("error");
								}
								res.send('success');
							});
					});
			}
			// uavs.view('get','all',{key:args.serialNo},function(error,data){
			// 	if(error)
			// 		res.sendStatus(500);
			// 	else if(data.rows[0]!=null){
			// 		args._id = data.rows[0].id;
			// 		args._rev = data.rows[0].value._rev;
			//
			// 	}
			// 	else
			// 		res.sendStatus(500);
			//
			// });

		}

	});
});


router.post('/delete',function(req,res){
	if(req.body.id && req.body.rev){
		var uavs = cloudant.db.use('uavs');
		uavs.destroy(req.body.id,req.body.rev,function(error){

			if(error)
				res.send("error");
			else{
				res.send('success');
			}
		});

	}
	else{
		res.send("error");
	}
});

router.get('/fetch',function(req,res){
	cloudant.db.list(function(err, allDbs) {
		if(err){
			res.send("failed to connect");
		}
		else {
			if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
				var uavs = cloudant.db.use('uavs');
				uavs.view('get','all',function(error,data){
					if(error)
						res.send("error");
					else{
						res.send(data);
					}
				});
			}
			else{
				var uavs = cloudant.db.use('uavs');
				uavs.view('get','operator',{key:req.session.user},function(error,data){
					if(error)
						res.send("error");
					else{
						res.send(data);
					}
				});
			}

		}

	});
});


router.get('/fetch/inventory',function(req,res){
	cloudant.db.list(function(err, allDbs) {
		if(err){
			res.send("failed to connect");
		}
		else {
			if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
				var uavs = cloudant.db.use('uavs');
				uavs.view('get','all',function(error,data){
					if(error)
						res.send("error");
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
				var uavs = cloudant.db.use('uavs');
				uavs.view('get','operator',{key:req.session.user},function(error,data){
					if(error)
						res.send("error");
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
				var uavs = cloudant.db.use('uavs');
				uavs.view('get','date',function(error,data){
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
				var uavs = cloudant.db.use('uavs');
				uavs.view('get','date',{key:req.session.user},function(error,data){
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
		}

	});
});

module.exports = router;
