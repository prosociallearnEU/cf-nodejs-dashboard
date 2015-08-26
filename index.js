/*jslint node: true*/
"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);

//REST API
app.use('/api', require('./routes/Routes')(express));
app.use(express.static(__dirname + '/public'));

//Server
var localPort = process.env.VCAP_APP_PORT || 3000;
http.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});
