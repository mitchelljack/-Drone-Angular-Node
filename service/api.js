var express = require('express');
var session = require('express-session');
var router = express.Router();
var cloudant = require("../config/db");
var Iot = require('cloudant');
var gateway  = require("../config/gateway");
var util = require('util');
var braintree = require('braintree');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var cloudant = require('../config/db');
var fileName = "../configuration.json"
var config

try {
  config = require(fileName)
}
catch (err) {
  config = {}
  console.log("unable to read file '" + fileName + "': ", err)
}

var iot_user = config.iotDb.username;
var iot_password = config.iotDb.password;
var iot = Iot({
    account: iot_user
    , password: iot_password
}, function (err, cloudant) {
    if (err) {
        return console.log('Failed to initialize Cloudant: ' + err.message);
    };
});

router.post('/v1/braintree/plans', function(request, response) {
  gateway.plan.all(function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});

router.post('/v1/braintree/getToken', function(request, response) {
  gateway.clientToken.generate({}, function (err, res) {
    if (err) throw err;
    response.json({
      "client_token": res.clientToken
    });
  });
});

router.post('/v1/braintree/customer', jsonParser, function (request, response) {
  var customer = request.body;
  gateway.customer.create({
    firstName: customer.firstName,
    lastName: customer.lastName,
    company: customer.company,
    email: customer.email,
    phone: customer.phone,
    fax: customer.fax,
    website: customer.website
  }, function (err, result) {
    if (err) throw err;
    response.json(result);
  });
});

router.post('/v1/braintree/paymentMethod', jsonParser, function (request, response) {
  var paymentMethod = request.body;
  gateway.paymentMethod.create({
    customerId: paymentMethod.customerId,
    paymentMethodNonce: paymentMethod.payment_method_nonce
  }, function (err, result) {
    if (err) throw err;
    response.json(result);
  });
});

router.post('/v1/braintree/subscription', jsonParser, function (request, response) {
  var subscription = request.body;
  gateway.subscription.create({
    paymentMethodToken: subscription.paymentMethodToken,
    planId: subscription.planid
  }, function (err, result) {
    if (err) throw err;
    response.json(result);
  });
});

router.post('/v1/braintree/update-subscription', jsonParser, function (request, response) {
  var subscription = request.body;
  gateway.subscription.update(subscription.subscriptionid, {
    paymentMethodToken: subscription.paymentMethodToken,
    planId: subscription.planid,
    price: subscription.price
  }, function (err, result) {
    if (err) throw err;
    response.json(result);
  });
});

router.post('/v1/braintree/transaction', jsonParser, function (request, response) {
  var transaction = request.body;
  gateway.transaction.sale({
    amount: transaction.amount,
    paymentMethodNonce: transaction.payment_method_nonce
  }, function (err, result) {
    if (err) throw err;
    console.log(util.inspect(result));
    response.json(result);
  });
});

router.get('/v1/checkDBConnection', function(req, res) {
    cloudant.db.list(function(err, allDbs) {
        if(err){
            res.send({status:"IOT database disconnected"});
        }
        iot.db.list(function (err, allDbs) {
            if (err) {
                res.send({status:"IOT database disconnected"});
            }
            res.send({status:"connected"});
        });
    });
});

router.post('/v1/app-service', function(req, res) {
    cloudant.db.list(function(err, allDbs) {
      if(req.body.version !=null) {
        var appservice = cloudant.db.use('appservice');
        var data = {
            version: req.body.version,
            timestamp: new Date().getTime()
        }
        appservice.insert(data, function(error,data){
            if(error)
                res.send(error);
            else{
                res.send('success');
            }
        });
      }
    });
});

router.post('/v1/login', function(req, res) {
	if(req.body.username !=null && req.body.password!=null){
		var users = cloudant.db.use('users');
		users.view('get','username',{key:req.body.username},function(err,data){
			if(err){
				res.send("username is invalid");
			}
			else{
				if(data.rows[0] && data.rows[0].value.password==req.body.password)
				{
            if(data.rows[0].value.type=="Pilot in Charge") {
      					req.session.user = req.body.username;
      					res.send({token: data.rows[0].id});
            } else {
                res.send("Only pilot can access");
            }
				}
				else {
					res.send("password is incorrect");
				}
			}
		});

	}
	else{
		res.send("parameter error");
	}
});

router.get('/v1/pbox', function(req, res) {
	if(req.headers.authorization !=null){
			var token = req.headers.authorization;
			cloudant.db.list(function(err, allDbs) {
				if(err){
					res.send("failed to connect");
				}
				else {
					var users = cloudant.db.use('users');
					users.view('get','id',{key:token},function(err,data){
						if(err){
							res.send("token is invalid");
						}
						else{
							if(data.rows[0] && data.rows[0].value.username)
							{
								var purpleboxes = cloudant.db.use('purpleboxes');
								purpleboxes.view('get','operator',{key:data.rows[0].value.username},function(error,data){
									if(error)
										res.send("error");
									else{
										result = [];
				            for(var i in data.rows){
											if(data.rows[i].value.status != 1)
				                result.push({name: data.rows[i].value.name,
																		 deviceid: data.rows[i].value._id,
																	 	 iotid: data.rows[i].value.serialNo});
				            }
				            res.send(result);
									}
								});
							}
							else{
								res.send("token is incorrect");
							}
						}
					});
				}
			});
		}
		else {
			res.send("unauthorized");
		}
});

router.get('/v1/jobs', function(req, res) {
	if(req.headers.authorization !=null){
			var token = req.headers.authorization;
			cloudant.db.list(function(err, allDbs) {
				if(err){
					res.send("failed to connect");
				}
				else {
					var users = cloudant.db.use('users');
					users.view('get','id',{key:token},function(err,data){
						if(err){
							res.send("token is invalid");
						}
						else{
							if(data.rows[0] && data.rows[0].value.username)
							{
								var jobs = cloudant.db.use('jobs');
								if(data.rows[0].value.type == "Flight Operator" || data.rows[0].value.type == "admin") {
		                jobs.view('active','operator',{key:data.rows[0].value.username}, function (err, data) {
		                    if(err){
		                        res.send("error");
		                    }
		                    else{
		                        // res.send(data);
														result = [];
								            for(var i in data.rows){
								                result.push({name: data.rows[i].value.name,
																						 id: data.rows[i].id });
								            }
								            res.send(result);
		                    }
		                });
								} else if(data.rows[0].value.type == "Pilot in Charge") {
										var pilot = data.rows[0].value.email;
										jobs.view('active','pilot', function (err, data1) {
												if(err){
														res.send("error");
												}
												else{
														// res.send(data);
														result = [];
														for(var i in data1.rows){
																var flag = false;
																for(var j in data1.rows[i].value.assignedPilots)
																		if(data1.rows[i].value.assignedPilots[j].email == pilot) {
																				flag = true;
																				break;
																		}

																if(flag)
																		result.push({name: data1.rows[i].value.name,
																						 id: data1.rows[i].id });
														}
														res.send(result);
												}
										});
								}
							}
							else{
								res.send("token is incorrect");
							}
						}
					});
				}
			});
		}
		else {
			res.send("unauthorized");
		}
});

router.post('/v1/flight/track', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            var args = req.body;
            if (args.alertStatus && args.id) {
                var flights = cloudant.db.use('flights');
                flights.get(args.id, function (error, data) {
                    if (error) res.send({status:"error"});
                    else {
                        var alertStatus = args.alertStatus;
                        data.alertStatus = alertStatus;
												flights.insert(data, function (error) {
                            if (error) res.send("error");
                            else {
                              var helper = require('sendgrid').mail

                  						from_email = new helper.Email("support@precision-autonomy.com");
                  						// to_email = new helper.Email(data.operator.email);
                              // to_email2 = new helper.Email(data.assignedPilots.email);
                              to_email = new helper.Email("jalexander.hc.317@gmail.com");
                              to_email2 = new helper.Email("victor0924@mail.com");

                  						subject = "Precision Autonomy – Alert";
                              var date = new Date(parseInt(data.flight_starttime)*1000);
                              var day = date.getDate() < 10?'0'+date.getDate():date.getDate();
                              var month = (date.getMonth()+1)<10?'0'+(date.getMonth()+1):(date.getMonth()+1);
                              var year = date.getFullYear();
                              var hour = date.getHours()<10?'0'+date.getHours():date.getHours();
                              var minute = date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes();
                              var emailContent = '<p>We are alerting you that flight "'+data.job+'-F'+data.count+'" triggered our drone crashing trigger</p><br>'
                                                +'<p>Flight Details:</p>'
                                                +'<table cellspacing="10"><tr><td colspan="2">Date:'+day+'.'+month+'.'+year+'</td><td colspan="2">Time:'+hour+':'+minute+'</td></tr>'
                                                +'<tr><td>Pilot: '+data.assignedPilots.name+'</td><td>UAV: '+data.assignedUavs[0].nickname+'</td><td>PAYLOAD: '+data.assignedPayloads[0].nickname+'</td><td>PASS: '+data.assignedPBs.nickname+'</td></tr>'
                                                +'</table><br>'
                                                +'<p>Please contact us if you have questions about this alert</p>'
                                                +'<p>Thanks</p><br>'
                                                +'<p>Precision Autonomy Support</p>'
                                                +'<p>support@precision-autonomy.com</p>'

                              var content = new helper.Content("text/html", emailContent);
                              //"Congratulation your Precision Autonomy Account has been created. Please contact us if you have any questions support@precision-autonomy.com"

                  						mail = new helper.Mail(from_email, subject, to_email, content)
                              mail2 = new helper.Mail(from_email, subject, to_email2, content)

                  						var sg = require('sendgrid')('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');
                  						var request = sg.emptyRequest({
                  							method: 'POST',
                  							path: '/v3/mail/send',
                  							body: mail.toJSON()
                  						});

                              var request2 = sg.emptyRequest({
                  							method: 'POST',
                  							path: '/v3/mail/send',
                  							body: mail2.toJSON()
                  						});

                  						sg.API(request, function(error, response) {
                  							if(response.statusCode == 202 || response.statusCode<=200) {
                                  sg.API(request2, function(error, response) {
                      							if(response.statusCode == 202 || response.statusCode<=200) {
                      								res.send("success");
                                    }
                      							else{
                      								res.send(error);
                      							}
                      						})
                                }
                  							else{
                  								res.send(error);
                  							}
                  						})
                            }
                        });
                    }
                })
            }
            else {
                res.send("error");
            }
        }
    });
});

router.post('/v1/flight/change-status', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            var args = req.body;
            if (args.newStatus && args.id) {
                var flights = cloudant.db.use('flights');
                var jobs = cloudant.db.use('jobs');
                flights.get(args.id, function (error, data) {
                    if (error) res.send({status:"error"});
                    else {
                        var currentStatus = data.currentStatus;
                        var newStatus = args.newStatus;
                        if (currentStatus == newStatus) {
                            res.send({status:"success"});
                        }
                        else {
                            data.currentStatus = newStatus;
														if(newStatus == "inactive")
																data.flight_endtime = args.timestamp;
														else if(newStatus == "active")
																data.flight_starttime = args.timestamp;
                            jobs.view('get', 'one', {
                                key: data.job
                            }, function (error, body) {
                                if (error) res.send({status:"error"});
                                else {
                                    var job = body.rows[0].value;
                                    if (job[currentStatus + 'Flights'] > 0) {
                                        job[currentStatus + 'Flights']--;
                                        job[newStatus + 'Flights']++;
                                        jobs.insert(job, function (error) {
                                            if (error) res.send("error");
                                            else {
                                                flights.insert(data, function (error) {
                                                    if (error) res.send("error");
                                                    else {
                                                        if(newStatus == "inactive") {
                                                            // var operators = cloudant.db.use('operators');
                                                            // operators.view('get','login',{key:data.operator.email},function(error,data){
                                                            //     if(error){
                                                            //         res.sendStatus(500);
                                                            //     }
                                                            //     else{
                                                            //         if(data.rows.length>0) {
                                                            //             if(data.rows[0].value.nonce) {
                                                            //                 gateway.transaction.sale({
                                                            //                   amount: 22.50,
                                                            //                   paymentMethodNonce: data.rows[0].value.nonce
                                                            //                 }, function (err, result) {
                                                            //                   if (err) throw err;
                                                            //                   res.send({status:"success"});
                                                            //                 });
                                                            //             } else {
                                                            //                 res.sendStatus(500);
                                                            //             }
                                                            //         }
                                                            //         else{
                                                            //           res.sendStatus(500);
                                                            //         }
                                                            //     }
                                                            // });
                                                            res.send({status:"success"});
                                                        } else {
                                                            res.send({status:"success"});
                                                        }
                                                    }
                                                });
                                            }
                                        })
                                    }
                                    else {
                                        res.send("error");
                                    }
                                }
                            });
                        }
                    }
                })
            }
            else {
                res.send("error");
            }
        }
    });
});

router.get('/v1/flights', function(req, res) {
	if(req.headers.authorization !=null){
			var token = req.headers.authorization;
			cloudant.db.list(function(err, allDbs) {
				if(err){
					res.send("failed to connect");
				}
				else {
					var users = cloudant.db.use('users');
					users.view('get','id',{key:token},function(err,data){
						if(err){
							res.send("token is invalid");
						}
						else{
							if(data.rows[0] && data.rows[0].value.username)
							{
                var flight = cloudant.db.use('flights');
								if(data.rows[0].value.type == "Flight Operator" || data.rows[0].value.type == "admin") {
		                flight.view('get','operator',{key:data.rows[0].value.username}, function (err, data) {
		                    if(err){
		                        res.send("error");
		                    }
		                    else{
		                        // res.send(data);
														result = [];
								            for(var i in data.rows){
																if(data.rows[i].value.currentStatus!="inactive")
								                		result.push({name: data.rows[i].value.job+'-F'+(data.rows[i].value.count),
																						 id: data.rows[i].id,
																					 	 deviceid:data.rows[i].value.assignedPBs.name });
								            }
								            res.send(result);
		                    }
		                });
								} else if(data.rows[0].value.type == "Pilot in Charge") {
										flight.view('get','pilot', {key:data.rows[0].value.username}, function (err, data1) {
												if(err){
														res.send("error");
												}
												else{
														// res.send(data);
														result = [];
														for(var i in data1.rows){
																if(data1.rows[i].value.currentStatus!="inactive" && data1.rows[i].value.currentStatus!="active" && data1.rows[i].value.hasOwnProperty("assignedPBs")) {
                                    var deviceid = data1.rows[i].value.assignedPBs?data1.rows[i].value.assignedPBs.name:"";
																		result.push({name: data1.rows[i].value.job+'-F'+(data1.rows[i].value.count),
																						 id: data1.rows[i].id,
																					   deviceid: deviceid});
                                }
														}
														res.send(result);
												}
										});
								}
							}
							else{
								res.send("token is incorrect");
							}
						}
					});
				}
			});
		}
		else {
			res.send("unauthorized");
		}
});

router.post('/v1/pbox/register', function(req, res) {
	if(req.headers.authorization !=null){
			if(req.body.deviceid !=null){
				var users = cloudant.db.use('users');
				users.view('get','id',{key:req.headers.authorization},function(err,data){
					if(err){
						res.send({status:false, error:'token is invalid'});
					}
					else{
						if(data.rows[0] && data.rows[0].value.username)
						{
							var operator_email = data.rows[0].value.email;
							var purpleboxes = cloudant.db.use('purpleboxes');
							purpleboxes.view('get','id',{key:req.body.deviceid},function(err,data){
								if(err){
									res.send({status:false, error:'deviceid is invalid'});
								}
								else{
									if(data.rows[0] && data.rows[0].value.operator.email == operator_email)
									{
											var args = data.rows[0].value;
											args.status = 1;
											purpleboxes.insert(args, function(err, body, header) {
												if (err) {
													res.send({status:false});
													return console.log(err.message);
												}
												res.send({status:true});
											});
									}
									else{
										res.send({status:false, error:'deviceid is incorrect'});
									}
								}
							});
						}
						else{
							res.send({status:false, error:'token is incorrect'});
						}
					}
				});
			}
			else{
				res.send({status:false, error:'parameter error'});
			}
		}
		else {
			res.send({status:false, error:'unauthorized'});
		}
});

router.post('/v1/pbox/unregister', function(req, res) {
	if(req.headers.authorization !=null){
			if(req.body.deviceid !=null){
				var users = cloudant.db.use('users');
				users.view('get','id',{key:req.headers.authorization},function(err,data){
					if(err){
						res.send({status:false, error:'token is invalid'});
					}
					else{
						if(data.rows[0] && data.rows[0].value.username)
						{
							var operator_email = data.rows[0].value.email;
							var purpleboxes = cloudant.db.use('purpleboxes');
							purpleboxes.view('get','id',{key:req.body.deviceid},function(err,data){
								if(err){
									res.send({status:false, error:'deviceid is invalid'});
								}
								else{
									if(data.rows[0] && data.rows[0].value.operator.email == operator_email)
									{
											var args = data.rows[0].value;
											args.status = 0;
											purpleboxes.insert(args, function(err, body, header) {
												if (err) {
													res.send({status:false});
													return console.log(err.message);
												}
												res.send({status:true});
											});
									}
									else{
										res.send({status:false, error:'deviceid is incorrect'});
									}
								}
							});
						}
						else{
							res.send({status:false, error:'token is incorrect'});
						}
					}
				});
			}
			else{
				res.send({status:false, error:'parameter error'});
			}
		}
		else {
			res.send({status:false, error:'unauthorized'});
		}
});

module.exports = router;
