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
			var customer = cloudant.db.use('customer');
			cloudinary.uploader.upload(args.croppedCompanyLogo, function(result) {
					args.croppedCompanyLogo = result.secure_url;
					customer.insert(args, function(err, body, header) {
						if (err) {
							res.send("error");
						}
						res.send('success');
					});
			});

		}

	});
});

router.get('/fetch',function(req,res){
	cloudant.db.list(function(err, allDbs) {
		if(err){
			res.send("failed to connect");
		}
		else {
			if (req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')) {
				var customer = cloudant.db.use('customer');
				customer.view('all','all',function(err,data){
					if(err){
						console.log(err);
						res.send("No Past flights found");
					}

					else{
						res.send(data);
					}
				});
			}
			else if(req.session.user){
				var customer = cloudant.db.use('customer');
				customer.view('all','all',{key:req.session.user},function(err,data){
					if(err){
						console.log(err);
						res.send("No Past flights found");
					}

					else{
						res.send(data);
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
			var customer = cloudant.db.use('customer');
			customer.view('get','date',function(error,data){
				if(error)
					res.send("error");
				else{
					var result = {};
					for(var i in data.rows){
						if(result[data.rows[i].key])
						{
							result[data.rows[i].key] +=1;
						}
						else{
							result[data.rows[i].key] =1;
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

	});
});

module.exports = router;
