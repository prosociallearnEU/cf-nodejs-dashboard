/*jslint node: true*/
"use strict";

//Dependencies
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);

//Express
app.use(express.static(__dirname + '/public_html'));
app.use(bodyParser.json());

//Routes
var Default = require('./routes/Default');
var Login = require('./routes/Login');
var Apps = require('./routes/Apps');

//REST API
app.get('/', Default.init);
app.post('/api/auth/login', Login.login);
app.get('/api/apps', Apps.getApps);
app.get('/api/apps/:guid/view', Apps.view);
app.post('/api/apps/create', Apps.create);

//Server
var localPort = process.env.VCAP_APP_PORT || 3000;
http.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});
