/*jslint node: true*/
"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);

//REST API
app.use('/', require('./routes/GlobalRoutes')(express));
app.use('/auth/', require('./routes/LoginRoutes')(express));
app.use('/spaces/', require('./routes/SpacesRoutes')(express));
app.use('/apps/', require('./routes/AppRoutes')(express));
app.use('/services/', require('./routes/ServiceRoutes')(express));
app.use(express.static(__dirname + '/public'));

//Templating
app.set('views', './views');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

//Server
//console.log("VCAP_APP_PORT" + process.env.VCAP_APP_PORT)
console.log("PORT" + process.env.PORT) // Diego
var localPort = process.env.PORT || 5000;
http.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});
