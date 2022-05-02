var express = require('express');
var fs = require("fs");
var router = express.Router();
var cloudant = require('../config/db');
var cloudinary = require('../config/cloudinary');
request = require('request');
var fileName = "../configuration.json"
var config

try {
  config = require(fileName)
}
catch (err) {
  config = {}
  console.log("unable to read file '" + fileName + "': ", err)
}
var username = config.iotDb.username;
var password = config.iotDb.password;

var addURL = 'https://' + config.iotService.org + '.internetofthings.ibmcloud.com/api/v0002/bulk/devices/add';
var removeURL = 'https://' + config.iotService.org + '.internetofthings.ibmcloud.com/api/v0002/bulk/devices/remove';
var headers = {
  "Content-Type": "application/json",
  'Authorization': 'Basic ' + new Buffer(config.iotService.apiKey + ":" + config.iotService.apiToken).toString('base64')
};


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
			var purpleboxes = cloudant.db.use('purpleboxes');
			var json_data = [{
				"typeId": "drone-alpha",
				"deviceId": args.serialNo,
				"deviceInfo": {},
				"location": {},
				"metadata": {},
				"authToken": "abcdefgh"
			}];
      console.log(json_data);
      console.log(addURL);
			request.post({
				url: addURL,
				json: json_data,
				headers: headers
			}, function(error, response, body){
				if(response.statusCode==201){
          cloudinary.uploader.upload(args.image, function(result) {
              args.image = result.secure_url;
              purpleboxes.insert(args, function(err, body, header) {
              	if (err) {
              		res.send("error");
              	}
              	res.send('success');
              });
          });
				}
				else{
					res.send("error");
				}
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
			var purpleboxes = cloudant.db.use('purpleboxes');
			var args = req.params;
			purpleboxes.get(req.params.id,{ revs_info: true },function(error,data) {
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
			var purpleboxes = cloudant.db.use('purpleboxes');


			purpleboxes.view('get','all',{key:args.serialNo},function(error,data){
				if(error)
					res.sendStatus(500);
				else if(data.rows[0]!=null){
					args._id = data.rows[0].id;
					args._rev = data.rows[0].value._rev;
					if(args.image.substring(0,5) == "https") {
              purpleboxes.insert(args, function(err, body, header) {
                if (err) {
                  res.send("error");
                }
                res.send('success');
              });
					} else {
							cloudinary.uploader.upload(args.image, function(result) {
									args.image = result.secure_url;
                  purpleboxes.insert(args, function(err, body, header) {
        						if (err) {
        							res.send("error");
        						}
        						res.send('success');
        					});
							});
					}

				}
				else res.sendStatus(500);
			});


		}

	});
});

router.get('/unregister/:id',function(req,res){
	cloudant.db.list(function(err, allDbs) {
		if(err){
			res.send("failed to connect");
		}
		else {
			var purpleboxes = cloudant.db.use('purpleboxes');
			var args = req.params;
			purpleboxes.get(req.params.id,{ revs_info: true },function(error,data) {
            if(error)
                res.sendStatus(500);
            else{
            	if(data){
                  data.status = 0;
                      purpleboxes.insert(data, function(err, body, header) {
          						if (err) {
          							res.send("error");

          						}

          						res.send('success');
      					  });
            	}
            	else{
            		res.sendStatus(404);
            	}

            }
        })
		  }
	});
});

router.post('/delete',function(req,res){
	if(req.body.id && req.body.rev){
    var purpleboxes = cloudant.db.use('purpleboxes');
    purpleboxes.get(req.body.id,{ revs_info: true },function(error,data) {
          if(error)
              res.sendStatus(500);
          else{
            if(data) {
                var json_data = [{
                  "typeId": "drone-alpha",
                  "deviceId": data.serialNo
                }];
                request.post({
                  url: removeURL,
                  json: json_data,
                  headers: headers
                }, function(error, response, body){
                  console.log(response.statusCode);
                  if(response.statusCode==201 || response.statusCode==202){
                      purpleboxes.destroy(req.body.id,req.body.rev,function(error){
                    			if(error)
                    				res.send("error");
                    			else{
                    				res.send('success');
                    			}
                  		});
                  }
                  else {
                    res.send("error");
                  }
                });
            }
            else {
              res.sendStatus(404);
            }
          }
      })
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
				var purpleboxes = cloudant.db.use('purpleboxes');
				purpleboxes.view('get','all',function(error,data){
					if(error)
						res.send("error");
					else{

						res.send(data);
					}
				});
			}
			else{
				var purpleboxes = cloudant.db.use('purpleboxes');
				purpleboxes.view('get','operator',{key:req.session.user},function(error,data){
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

router.get('/fetch/totalnum',function(req,res){
	cloudant.db.list(function(err, allDbs) {
		if(err){
			res.send("failed to connect");
		}
		else {
				var purpleboxes = cloudant.db.use('purpleboxes');
				purpleboxes.view('get','all',function(error,data){
					if(error)
						res.send("error");
					else{
            res.send(data);
					}
				});
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
				var purpleboxes = cloudant.db.use('purpleboxes');
				purpleboxes.view('get','all',function(error,data){
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
				var purpleboxes = cloudant.db.use('purpleboxes');
				purpleboxes.view('get','operator',{key:req.session.user},function(error,data){
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
				var purpleboxes = cloudant.db.use('purpleboxes');
				purpleboxes.view('get','date',function(error,data){
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
				var purpleboxes = cloudant.db.use('purpleboxes');
				purpleboxes.view('get','date',{key:req.session.user},function(error,data){
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
