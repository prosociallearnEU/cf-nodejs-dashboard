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
var cloudFoundryApps = require("cf-nodejs-client").Apps;
cloudFoundry = new cloudFoundry(config.CF_API_URL);
cloudFoundryApps = new cloudFoundryApps(config.CF_API_URL);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var appMacros = require("./AppMacros");
appMacros = new appMacros(config.CF_API_URL,config.username,config.password);

//WEB

app.get('/', function (req, res) {
    res.render('index.html');
});

//REST API

// POST /api/auth/login
// @desc: Login
app.post("/api/auth/login", jsonParser, function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

	var token_endpoint = null;

	cloudFoundry.getInfo().then(function (result) {
		token_endpoint = result.token_endpoint;
	    return cloudFoundry.login(token_endpoint,config.username,config.password);
	}).then(function (result) {
	    res.json({ "auth_token" : result.token_type + " " + result.access_token});  
	}).catch(function (reason) {
	    res.json({"error": reason});
	});

});

// POST /api/apps
// @desc: get Apps
app.get("/api/apps", jsonParser, function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    console.log(username);
    console.log(password);

	var token_endpoint = null;

	cloudFoundry.getInfo().then(function (result) {
		token_endpoint = result.token_endpoint;	
		return cloudFoundry.login(token_endpoint,config.username,config.password);
	}).then(function (result) {
            return cloudFoundryApps.getApps(result.token_type,result.access_token);
	}).then(function (result) {
        res.json(result); 
	}).catch(function (reason) {
	    res.json({"error": reason});
	});

});

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

app.post("/api/apps/create", jsonParser, function (req, res) {

    var appname = req.body.appname;

    console.log(appname);

	var token_endpoint = null;

	var appName = "demo" + randomInt(1,100);
	var staticBuildPack = "https://github.com/cloudfoundry/staticfile-buildpack";
	//appMacros.createApp(appName,staticBuildPack)

	return appMacros.createApp(appName,staticBuildPack).then(function (result) {
        var app_guid = result.metadata.guid;
        res.json(result); 
	}).catch(function (reason) {
	    res.json({"error": reason});
	});

});

//
var localPort = process.env.VCAP_APP_PORT || 3000;
http.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});

