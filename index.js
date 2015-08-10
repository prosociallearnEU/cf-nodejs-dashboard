/*jslint node: true*/
/*global describe: true, it: true*/
"use strict";

//Express
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static(__dirname + '/public_html'));

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//CF
var config = require('./config.json');
var cloudFoundry = require("cf-nodejs-client").CloudFoundry;
cloudFoundry = new cloudFoundry(config.CF_API_URL);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//WEB

app.get('/', function (req, res) {
    res.render('index.html');
});

//REST API

// POST /api/auth/login
// @desc: logs in a user
app.post("/api/auth/login", urlencodedParser, function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

	var token_endpoint = null;

	cloudFoundry.getInfo().then(function (result) {
		token_endpoint = result.token_endpoint;	
		return result;
//	    return cloudFoundry.login(token_endpoint,config.username,config.password);
	}).then(function (result) {
		res.json(result) 
	    //res.json({ "auth_token" : result.token_type + " " + result.access_token});  
	}).catch(function (reason) {
	    res.json({"error": reason});
	});

});

//
var localPort = process.env.VCAP_APP_PORT || 3000;
http.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});

