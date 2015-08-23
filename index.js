/*jslint node: true*/
"use strict";

//Dependencies
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);

//Express
app.use(bodyParser.json());

//Routes
//var Login = require('./routes/Login');
//var Apps = require('./routes/Apps');

//REST API
app.use('/api', require('./routes/Demo')(express));
/*    
    .post('/auth/login', Login.login)
    .get('/apps', Apps.getApps)
    .get('/apps/:guid/view', Apps.view)
    .post('/apps/create', Apps.create));
*/

app.use(express.static(__dirname + '/public'));

//Server
var localPort = process.env.VCAP_APP_PORT || 3000;
http.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});
