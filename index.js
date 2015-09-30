/*jslint node: true*/
"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);

//REST API
app.use('/api', require('./routes/Routes')(express));

//Templates in HTML
app.use(express.static(__dirname + '/public'));
app.set('views', './views');
//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');    


//Server
var localPort = process.env.VCAP_APP_PORT || 3000;
http.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});
