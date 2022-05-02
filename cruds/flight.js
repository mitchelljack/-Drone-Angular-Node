var Iot = require('cloudant');
var express = require('express');
var fs = require("fs");
var router = express.Router();
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
    account: iot_user,
    password: iot_password
}, function (err, cloudant) {
    if (err) {
        return console.log('Failed to initialize Cloudant: ' + err.message);
    }
});
Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};
router.post('/create', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
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
            if (args.job) {
                var jobs = cloudant.db.use('jobs');
                var flights = cloudant.db.use('flights');
                var rev = "";
                jobs.view('get', 'one', {
                    key: args.job
                }, function (error, data) {
                    if (error) {
                        res.send("error");
                    }
                    if (data.rows[0].value) {
                        rev = data.rows[0].value._rev;
                        data.rows[0].value["pendingFlights"]+=1;
                        jobs.insert(data.rows[0].value, function (error, fdata, header) {
                            if (error) res.send("error");
                            else {
                                // args.count = data.rows[0].value.pendingFlights + data.rows[0].value.activeFlights + data.rows[0].value.inactiveFlights + 1;
                                // data.rows[0].value.pendingFlights = data.rows[0].value.pendingFlights + 1;
                                args.count = data.rows[0].value.pendingFlights + data.rows[0].value.activeFlights + data.rows[0].value.inactiveFlights;
                                args.currentStatus = "pending";
                                flights.insert(args, function (error, data, header) {
                                    if (error) res.send("error");
                                    else {
                                        res.send({
                                            success: args.job + '-F' + args.count
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else {
                        res.send("error");
                    }
                });
            }
            else {
                res.send("error");
            }
        }
    });
});


router.post('/edit', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
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
            if (args.job) {
                var flights = cloudant.db.use('flights');
                flights.view('get','one',{key:args.name},function(error,data){
                    if(error){
                        res.sendStatus(500);
                    }
                    else if(data.rows[0]){
                        args._id = data.rows[0].value._id;
                        args._rev = data.rows[0].value._rev;
                        args.count = data.rows[0].value.count;
                        args.currentStatus=data.rows[0].value.currentStatus;
                        flights.insert(args, function (error, data, header) {
                            if (error) res.send("error");
                            else {
                                res.send({
                                    success: args.job + '-F' + args.count
                                });
                            }
                        });
                    }
                    else{
                        res.sendStatus(500);
                    }
                })

            }
            else {
                res.send("error");
            }
        }
    });
});

router.get('/fetch/:job', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            var flights = cloudant.db.use('flights');
            var job = req.params.job;
            flights.view('get', 'job', {
                key: job
            }, function (error, data) {
                if (error) res.send("error");
                else {
                    res.send(data);
                }
            });
        }
    });
});
router.get('/fetch', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            var flights = cloudant.db.use('flights');
            flights.view('get', 'all', function (error, data) {
                if (error) res.send("error");
                else {
                    res.send(data);
                }
            });
        }
    });
});
router.get('/inventory', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            if (req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')) {
                var flights = cloudant.db.use('flights');
                flights.view('get', 'inventory', function (error, data) {
                    if (error) res.send("error");
                    else {
                        result = [];
                        for(var i in data.rows){
                            var value = data.rows[i].value;
                            value.id = data.rows[i].id;
                            result.push(value);
                        }
                        res.send(result);
                    }
                });
            }
            else {
                var flights = cloudant.db.use('flights');
                if(req.session.type == 'Pilot in Charge') {
                    jobs.view('get','pilot',{key:req.session.user}, function (err, data) {
                        if (error) res.send("error");
                        else {
                            result = [];
                            for(var i in data.rows){
                                var value = data.rows[i].value;
                                value.id = data.rows[i].id;
                                result.push(value);
                            }
                            res.send(result);
                        }
                    });
                } else {
                    flights.view('get','operator',{key:req.session.user}, function (err, data) {
                        if (err) res.send("err");
                        else {
                            result = [];
                            for(var i in data.rows){
                                var value = data.rows[i].value;
                                value.id = data.rows[i].id;
                                result.push(value);
                            }
                            res.send(result);
                        }
                    });
                }
            }
        }
    });
});
router.post('/delete', function (req, res) {
    if (req.body.id && req.body.rev) {
        var flights = cloudant.db.use('flights');
        var jobs = cloudant.db.use('jobs');
        flights.destroy(req.body.id, req.body.rev, function (error) {
            if (error) res.send("error");
            else {
                jobs.view('get','one',{key:req.body.job},function(error,data){
                    if(error || data.rows.length<=0){
                        res.sendStatus(500);
                    }
                    else{
                        var job = data.rows[0].value;
                        var currentStatus = req.body.currentStatus+"Flights";
                        if(job[currentStatus])
                        {
                            job[currentStatus]-=1;
                            jobs.insert(job,function(error,data){
                                if(error){
                                    res.sendStatus(500);
                                }
                                else{
                                    res.send("success");
                                }
                            });
                        }
                        else{
                            res.sendStatus(500);
                        }
                    }
                });


            }
        });

    }
    else {
        res.send("error");
    }
});
router.get('/graph/total', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            var flights = cloudant.db.use('flights');
            flights.view('get', 'pending', function (error, data) {
                if (error) res.send("error");
                else {
                    var pending = data.rows.length;
                    flights.view('get', 'active', function (error, sdata) {
                        if (error) res.send("error");
                        else {
                            var active = sdata.rows.length;
                            res.send([pending, active]);
                        }
                    });
                }
            });
        }
    });
});

router.post('/change-status', function (req, res) {
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
                    if (error) res.send("error");
                    else {
                        var currentStatus = data.currentStatus;
                        var newStatus = args.newStatus;
                        if (currentStatus == newStatus) {
                            res.send("success");
                        }
                        else {
                            data.currentStatus = newStatus;
                            jobs.view('get', 'one', {
                                key: data.job
                            }, function (error, body) {
                                if (error) res.send("error");
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
                                                        res.send("success");
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
router.get('/fetch/date', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            var flights = cloudant.db.use('flights');
            flights.view('get', 'date', function (error, data) {
                if (error) res.send("error");
                else {
                    var result = {};
                    for (var i in data.rows) {
                        if (result[data.rows[i].key]) {
                            result[data.rows[i].key] += 1;
                        }
                        else {
                            result[data.rows[i].key] = 1;
                        }
                    }
                    var response = [];
                    for (var i in result) {
                        response.push([i, result[i]]);
                    }
                    res.send(response);
                }
            });
        }
    });
});
router.get('/fetch/one/:id', function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            var flights = cloudant.db.use('flights');
            var id = req.params.id;
            flights.view('get', 'one', {
                key: id
            }, function (error, data) {
                if (error) res.send("error");
                else {
                    res.send(data);
                }
            });
        }
    });
});

function convertFromBaseToBase(str, callBack) {
    var num = parseInt(str, 16);
    num = num.toString(10);
    callBack(num);
}

router.get('/fetch/gps/:id/:flightid/:timestamp', function (req, res) {
    iot.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            var date = new Date();
            if(req.params.timestamp)
                date = new Date(req.params.timestamp*1000);
                var month = date.getMonth()+1;
                var mydb = 'iotp_' + config.iotService.org + '_default_' + (date.getFullYear()) + '-' + (month<10 ? '0'+month : month);

            var testRequest = function (query) {
                iot.request({
                    db: mydb
                    , method: 'POST'
                    , doc: '_find'
                    , body: query
                }, function (err, data) {
                    if (err) {
                        res.sendStatus(500);
                    }
                    else {
                        var result = {
                            lat: 0
                            , lng: 0
                            ,data:[]
                            ,altitude:[]
                            ,azimut:[]
                            ,humidity:[]
                            ,light:[]
                            ,pitch:[]
                            ,pressure:[]
                            ,roll:[]
                            ,sound:[]
                            ,battery:[]
                            ,temperature:[]
                            ,positions:[]
                            ,yaw:[]
                            ,timestamp:[]
                        };
                        var sorted = [];
                        var previous_timestamp = "";
                        if (data.docs) {
                            for (var i in data.docs) {
                              if(data.docs[i].data.data)
                                sorted.push(data.docs[i].data.data.block);
                            }
                            sorted.sort(function(a,b){
                                return new Date(a.timestamp)-new Date(b.timestamp);
                            });
                            for(var i in sorted){
                                if(sorted[i] != null && sorted[i].gpsLng && sorted[i].gpsLng!=""
                                    && sorted[i].flight_number && sorted[i].flight_number == req.params.id+"-"+req.params.flightid){
                                    result.data.push(sorted[i].gpsLng);
                                    result.data.push(sorted[i].gpsLat);
                                    result.altitude.push(sorted[i].altitude);
                                    result.azimut.push(sorted[i].azimut);
                                    result.humidity.push(sorted[i].humidity);
                                    result.light.push(sorted[i].light);
                                    result.pitch.push(sorted[i].pitch);
                                    result.pressure.push(sorted[i].pressure);
                                    result.roll.push(sorted[i].roll);
                                    result.sound.push(sorted[i].sound);
                                    result.battery.push(sorted[i].battery);
                                    result.temperature.push(sorted[i].temperature);
                                    result.yaw.push(sorted[i].yaw);
                                    result.timestamp.push(sorted[i].timestamp);
                                    result.positions.push(sorted[i].gpsLng);
                                    result.positions.push(sorted[i].gpsLat);
                                } else {
                                    if(result.data.length < 10){
                                        result = {
                                            lat: 0
                                            , lng: 0
                                            ,data:[]
                                            ,altitude:[]
                                            ,azimut:[]
                                            ,humidity:[]
                                            ,light:[]
                                            ,pitch:[]
                                            ,pressure:[]
                                            ,roll:[]
                                            ,sound:[]
                                            ,battery:[]
                                            ,temperature:[]
                                            ,positions:[]
                                            ,yaw:[]
                                            ,timestamp:[]
                                        };
                                    }
                                }
                            }
                        }
                        res.send(result);
                    }
                });

            }
            //req.params.id
            var query = {
                "selector": {
                    "_id": {
                        "$gt": 0
                    }
                    ,"deviceId":req.params.id

                }
                , "fields": [
                "_id"
                , "_rev"
                , "data"
                ,"timestamp"
                ]
                , "sort": [
                {
                    "_id": "asc"
                }
                ]
            };
            testRequest(query);
        }
    });
});


router.get('/fetch/iot-data/:id/:flightid', function (req, res) {
  iot.db.list(function (err, allDbs) {
      if (err) {
          res.send("failed to connect");
      }
      else {
          var mydb = 'iotp_' + config.iotService.org + '_default_' + (new Date().getFullYear()) + '-' + (new Date().getMonth() + 1);
          var testRequest = function (query) {
              iot.request({
                  db: mydb
                  , method: 'POST'
                  , doc: '_find'
                  , body: query
              }, function (err, data) {
                  if (err) {
                      res.sendStatus(500);
                  }
                  else {
                      var sorted = [], result=[];
                      for (var i in data.docs)
                          sorted.push(data.docs[i].data.data.block);
                      sorted.sort(function(a,b){
                          return new Date(a.timestamp)-new Date(b.timestamp);
                      });
                      for(var i in sorted){
                          if(sorted[i] != null && sorted[i].gpsLng && sorted[i].gpsLng!=""
                            && sorted[i].flight_number && sorted[i].flight_number == req.params.id+"-"+req.params.flightid){
                              result.push(sorted[i]);
                          } else {
                              if(result.length < 50){
                                  result = [];
                              }
                          }
                      }
                      res.send(result);
                  }
              });

          }
          //req.params.id
          var query = {
              "selector": {
                  "_id": {
                      "$gt": 0
                  }
                  ,"deviceId":req.params.id

              }
              , "fields": [
              "_id"
              , "_rev"
              , "data"
              ,"timestamp"
              ]
              , "sort": [
              {
                  "_id": "asc"
              }
              ]
          };
          testRequest(query);
      }
  });
});



module.exports = router;
