/*jslint node: true*/
"use strict";

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

module.exports = function (express) {

    var router = express.Router();
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded

    router.use(cookieParser());

	router.get('/', function (req, res) {

		console.log("GET /")

	    var ssl = false;
	    if (req.headers['x-forwarded-proto'] === "https") {
	        ssl = true;
	    }
	    ssl = true;//Local
	    if (ssl) {
	        res.redirect('/auth');
	    } else {
	        res.redirect('https://psldeploymanager6.cfapps.io');
	    }
	});

	router.get('/home', function (req, res) {

		console.log("GET /home/")

	/*
	    if (req.signedCookies['psl_session']) {
	        console.log(req.signedCookies.psl_session);
	    }
	*/
	    if (req.cookies.psl_session) {
	        console.log(req.cookies.psl_session);
	    }

	    res.render('home.jade');
	});

    return router;
};