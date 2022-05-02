var express = require('express');
var app = express();
var auth = require("./service/auth");
var session = require('express-session');
var path = require('path');
var ibmiotf = require('ibmiotf');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.json({limit: '50mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({ limit: '50mb',extended: true })); // support encoded bodies
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false,
	httpOnly: false
}));

var cfenv = require('cfenv');
var users = require("./cruds/users");
var job = require("./cruds/job");
var flight = require("./cruds/flight");
var pilot = require('./cruds/pilot');
var uav = require('./cruds/uav');
var purplebox = require('./cruds/purplebox');
var formidable = require('formidable');
var operator = require('./cruds/operator');
var customer = require('./cruds/customer');
var payload = require('./cruds/payload');
var options = require('./cruds/options');
var appservice = require('./cruds/appservice');
var api = require('./service/api');
var appEnv = cfenv.getAppEnv();

app.use('/users',users);
app.use('/job',job);
app.use('/flight',flight);
app.use('/pilot',pilot);
app.use('/purplebox',purplebox);
app.use('/uav',uav);
app.use('/operator',operator);
app.use('/customer',customer);
app.use('/payload',payload);
app.use('/options',options);
app.use('/appservice',appservice);
app.use('/api',api);


app.get('/ping', function(req,res) {
	var responseObj = {};
	responseObj.status = "You are talking to the Precision Automation Web Service";

	res.status(200);
	res.json(responseObj);
	res.send();
});


app.post("/upload",function(req, res){
	var form = new formidable.IncomingForm();
	form.uploadDir = __dirname+"/public/uploads/";
	form.parse(req, function(err, fields, files) {
		if(err){
			console.log(err);
			res.send("error");
		}
		else if(files){
			var fileName = files.file.name;
			var imgName = path.parse(files.file.path);
			res.send(imgName.name);
		}

	});
});

app.use([auth.isAuthenticated,express.static(__dirname + '/public')]);

app.get("/reset/",function(req,res){
	var email = req.param('email');
	var sendmail = require('sendmail')();

	sendmail({
		from: 'no-reply@precision-autonomy.com',
		to: email,
		subject: 'Reset Password',
		content: '',
	}, function(err, reply) {
		console.log(err && err.stack);
		console.dir(reply);
	});
});

app.post("/check",function(req,res){
	console.log(req.body);
	res.send('accessable');
});


app.post('/isAdmin',function(req,res){
    if (req.session && req.session.type && req.session.type == 'Administrator'){
        res.send(true);
    }
    else{
        res.send(false);
    }
});


io.on('connection',function(socket){

	console.log("Socket Connected");
	socket.on('request',function(id){
		// var config = {
		//     "org" : "plh376",
		//     "id" : "pb101",
		//     "type" : "drone-alpha",
		//     "auth-method" : "token",
		//     "auth-token" : "abcdefgh"
		// };
		var config = {
		    "org" : "plh376",
		    "id" : id,
		    "auth-key" : "a-plh376-ftyrphsihy",
		    "auth-token" : "oXh_C8N7gcN-MXFd6b"
		};
		var appClient = new ibmiotf.IotfApplication(config);
		appClient.connect();
		appClient.on('connect', function () {
			console.log(id+" Device is connected");
			appClient.subscribeToDeviceEvents();
			appClient.on('deviceEvent',function(deviceType, deviceId, eventType, format, payload){
				payload = JSON.parse(payload.toString('utf-8'));
				if(payload.data.block){
					console.log(payload.data.block);
					socket.emit('data', payload.data.block);
				}
			});
		});

		appClient.on("error", function (err) {
		    console.log("Error : "+err);
		});

	});

});

// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
//
// app.listen(80, '0.0.0.0', function() {
// 	console.log("server starting on " + appEnv.url);
// });
