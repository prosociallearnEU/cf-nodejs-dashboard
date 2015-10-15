/*jslint node: true*/
"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);

//REST API
app.use('/', require('./routes/GlobalRoutes')(express));
app.use('/auth/', require('./routes/LoginRoutes')(express));
app.use('/apps/', require('./routes/AppRoutes')(express));
app.use(express.static(__dirname + '/public'));

//Templating
app.set('views', './views');
app.engine('jade', require('jade').__express);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
//app.set('view engine', 'jade');

//Server
var localPort = process.env.VCAP_APP_PORT || 3000;
http.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});
