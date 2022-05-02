var express = require('express');
var router = express.Router();
var cloudant = require('../config/db');
var checkParams = function (req, res, next) {
    var params = body.params;
};
router.post("/create", function (req, res) {
    // console.log(req.body);
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {

            var args = req.body;
            var jobs = cloudant.db.use('jobs');

            jobs.view('all','all',{key:args.customer}, function (err, data) {
                if(err){
                    res.send("No Past flights found");
                }
                else{
                    args.count = 0;
                    for(var i in data.rows){
                        if(data.rows[i].value>args.count){
                            args.count = data.rows[i].value;
                        }
                    }
                    args.count++;
                    args.activeFlights = 0;
                    args.pendingFlights = 0;
                    args.inactiveFlights = 0;
                    jobs.insert(args, function (err, body, header) {
                        if (err) {
                            res.send("error");
                        }
                        res.send('success');
                    });
                }

            });

        }
    });
});

router.post("/edit", function (req, res) {
    // console.log(req.body);
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {

            var args = req.body;
            var jobs = cloudant.db.use('jobs');

            jobs.view('get','one',{key:args.name}, function (err, data) {
                if(err){
                    res.send("No Past flights found");
                }
                else if(data.rows[0]){
                    args._id = data.rows[0].id;
                    args._rev = data.rows[0].value._rev;
                    args.count = data.rows[0].value.count;
                    args.activeFlights = data.rows[0].value.activeFlights;
                    args.pendingFlights = data.rows[0].value.pendingFlights;
                    args.inactiveFlights = data.rows[0].value.inactiveFlights;
                    args.customer = data.rows[0].value.customer;


                    jobs.insert(args, function (err, body, header) {
                        if (err) {
                            res.sendStatus(
                                );
                        }
                        res.send('success');
                    });
                }
                else{
                    res.sendStatus(500);
                }
            });

        }
    });
});


router.post('/delete',function(req,res){
    if(req.body.id && req.body.rev){
        var jobs = cloudant.db.use('jobs');
        var flights = cloudant.db.use('flights');
        var job = req.body.name;
        flights.view('get', 'job', {
            key: job
        }, function (error, data) {
            if (error) res.send("error");
            else {
                for(var i in data.rows){
                    flights.destroy(data.rows[i].value._id, data.rows[i].value._rev,function(error) {
                    })
                }
                jobs.destroy(req.body.id,req.body.rev,function(error){
                    if(error){
                        res.send("error");
                    }
                    else{
                        res.send('success');
                    }
                });
            }
        });
    }
    else{
        res.send("error");
    }
});

router.get("/fetch/past", function (req, res) {
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("error");
        }
        else {
            if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
                var jobs = cloudant.db.use('jobs');
                jobs.view('past','operator', function (err, data) {
                    if(err){

                        res.send("error");
                    }
                    else{
                        res.send(data);
                    }
                });
            }
            else{
                var jobs = cloudant.db.use('jobs');
                if(req.session.type == 'Pilot in Charge') {
                    jobs.view('past','pilot',{key:req.session.user}, function (err, data) {
                        if(err){
                            res.send("error");
                        }
                        else{
                            res.send(data);
                        }
                    });
                } else {
                    jobs.view('past','operator',{key:req.session.user}, function (err, data) {
                        if(err){
                            res.send("error");
                        }
                        else{
                            res.send(data);
                        }
                    });
                }
            }
        }
    });
});

router.get("/fetch/active",function(req,res){
    cloudant.db.list(function (err, allDbs) {
        if (err) {
            res.send("failed to connect");
        }
        else {
            if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
                var jobs = cloudant.db.use('jobs');
                jobs.view('active','operator', function (err, data) {
                    if(err){

                        res.send("error");
                    }
                    else{
                        res.send(data);
                    }
                });
            }
            else{
                var jobs = cloudant.db.use('jobs');
                if(req.session.type == 'Pilot in Charge') {
                    jobs.view('active','pilot',{key:req.session.user}, function (err, data) {
                        if(err){
                            res.send("error");
                        }
                        else{
                            res.send(data);
                        }
                    });
                } else {
                    jobs.view('active','operator',{key:req.session.user}, function (err, data) {
                        if(err){
                            res.send("error");
                        }
                        else{
                            res.send(data);
                        }
                    });
                }
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
            if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
                var jobs = cloudant.db.use('jobs');
                jobs.view('get','job',function(err,data){
                    if(err){
                        res.send("error");
                    }
                    else{
                        res.send(data);
                    }
                });
            }
            else{
                var jobs = cloudant.db.use('jobs');
                jobs.view('get','job',{key:req.session.user},function(err,data){
                    if(err){
                        res.send("error");
                    }
                    else{
                        res.send(data);
                    }
                });
            }

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
                var jobs = cloudant.db.use('jobs');
                jobs.view('get','job',function(err,data){
                    if(err){
                        res.send("error");
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
                var jobs = cloudant.db.use('jobs');
                jobs.view('get','job',{key:req.session.user},function(err,data){
                    if(err){
                        res.send("error");
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


router.get("/fetch/companies",function(req,res){
    cloudant.db.list(function(err,allDbs){
        if(err){
            res.send("error");
        }
        else{
            var jobs = cloudant.db.use('jobs');
            jobs.view('get','job',function(err,data){
                if(err){
                    res.status(500).send("error");
                }
                else{
                    var result = {};
                    var rows = data.rows;
                    for(var i in rows){
                        if(result[rows[i].value.customer]){
                            result[rows[i].value.customer].jobs += 1;
                            result[rows[i].value.customer].flights += rows[i].value.activeFlights + rows[i].value.pendingFlights+rows[i].value.inactiveFlights;
                            result[rows[i].value.customer].pilots += rows[i].value.pilots;
                            result[rows[i].value.customer].uavs += rows[i].value.uavs;
                        }
                        else if(rows[i].value.customer != null){
                            result[rows[i].value.customer] = {};
                            result[rows[i].value.customer].company = rows[i].value.customer;
                            result[rows[i].value.customer].jobs = 1;
                            result[rows[i].value.customer].flights = rows[i].value.activeFlights + rows[i].value.pendingFlights+rows[i].value.inactiveFlights;
                            result[rows[i].value.customer].pilots = rows[i].value.pilots;
                            result[rows[i].value.customer].uavs = rows[i].value.uavs;
                        }
                    }
                    var customer = cloudant.db.use('customer');
                    customer.view('all','all',function(err,data){
                        if(err){
                            res.status(404).send("error");
                        }
                        else{
                            for(var i in data.rows){
                                if(!result[data.rows[i].value]){
                                    result[data.rows[i].value] = {};
                                    result[data.rows[i].value].company =data.rows[i].value;
                                    result[data.rows[i].value].jobs = 0;
                                    result[data.rows[i].value].flights = 0;
                                    result[data.rows[i].value].pilots = 0;
                                    result[data.rows[i].value].uavs = 0;
                                }
                            }
                            res.send(result);
                        }
                    });
                }
            });
        }
    });
});


router.get("/fetch/active/type",function(req,res){
    cloudant.db.list(function(err,allDbs){
        if(err){
            res.send("error");
        }
        else{
            if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
                var jobs = cloudant.db.use('jobs');
                jobs.view('get','activetype',function(err,data){
                    if(err){
                        res.send("error");
                    }
                    else{
                        var result = {};
                        for(var i in data.rows){
                            if(result[data.rows[i].value.type])
                            {
                                result[data.rows[i].value.type]+=1;
                            }
                            else
                            {
                                result[data.rows[i].value.type]=1;
                            }
                        }
                        var colorCount = 0;
                        var colors = ['#F68C42','#F89E5F','#F9A972','#FAB584', '#FAB584','#FBCAA7'];
                        var response = {data:[],categories:[]};
                        for(var i in result){
                            response.data.push({color:"#F68C42",y:result[i]});
                            response.categories.push(i);
                            colorCount++;
                        }
                        res.send(response);
                    }
                });
            }
            else{

                var jobs = cloudant.db.use('jobs');
                jobs.view('get','activetype',{key:req.session.user},function(err,data){
                    if(err){
                        res.send("error");
                    }
                    else{
                        var result = {};
                        for(var i in data.rows){
                            if(result[data.rows[i].value.type])
                            {
                                result[data.rows[i].value.type]+=1;
                            }
                            else
                            {
                                result[data.rows[i].value.type]=1;
                            }
                        }
                        var colorCount = 0;
                        var colors = ['#F68C42','#F89E5F','#F9A972','#FAB584', '#FAB584','#FBCAA7'];
                        var response = {data:[],categories:[]};
                        for(var i in result){
                            response.data.push({color:"#F68C42",y:result[i]});
                            response.categories.push(i);
                            colorCount++;
                        }
                        res.send(response);
                    }
                });
            }
        }
    });
});

router.get("/fetch/past/type",function(req,res){
    cloudant.db.list(function(err,allDbs){
        if(err){
            res.send("error");
        }
        else{
            if(req.session.user && (req.session.user == 'admin@drone.com' || req.session.user == 'demo@drone.com')){
                var jobs = cloudant.db.use('jobs');
                jobs.view('get','pasttype',function(err,data){
                    if(err){
                        res.send("error");
                    }
                    else{
                        var result = {};
                        for(var i in data.rows){

                            if(result[data.rows[i].value.type])
                            {
                                result[data.rows[i].value.type]+=1;
                            }
                            else
                            {
                                result[data.rows[i].value.type]=1;
                            }
                        }
                        var colorCount = 0;
                        var colors = ['#F68C42','#F89E5F','#F9A972','#FAB584', '#FAB584','#FBCAA7'];
                        var response = {data:[],categories:[]};
                        for(var i in result){
                            response.data.push({color:colors[colorCount],y:result[i]});
                            response.categories.push(i);
                            colorCount++;
                        }
                        res.send(response);
                    }
                });
            }
            else{
                var jobs = cloudant.db.use('jobs');
                jobs.view('get','pasttype',{key:req.session.user},function(err,data){
                    if(err){
                        res.send("error");
                    }
                    else{
                        var result = {};
                        for(var i in data.rows){

                            if(result[data.rows[i].value.type])
                            {
                                result[data.rows[i].value.type]+=1;
                            }
                            else
                            {
                                result[data.rows[i].value.type]=1;
                            }
                        }
                        var colorCount = 0;
                        var colors = ['#F68C42','#F89E5F','#F9A972','#FAB584', '#FAB584','#FBCAA7'];
                        var response = {data:[],categories:[]};
                        for(var i in result){
                            response.data.push({color:colors[colorCount],y:result[i]});
                            response.categories.push(i);
                            colorCount++;
                        }
                        res.send(response);
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
            var jobs = cloudant.db.use('jobs');
            jobs.view('get','date',function(error,data){
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


router.get("/fetch/one/:id",function(req,res){
    var id = req.params.id;
    cloudant.db.list(function(err,allDbs){
        if(err){
            res.send("error");
        }
        else{
            var jobs = cloudant.db.use('jobs');
            jobs.view('get','one',{key:id},function(err,data){
                if(err){
                    res.send("error");
                }
                else{

                    res.send(data);
                }
            });
        }
    });
});

module.exports = router;
