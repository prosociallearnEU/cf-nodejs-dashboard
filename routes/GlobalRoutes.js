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
	    	console.log("Redirect to /auth");
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
		var username = "";

	    if (req.cookies.psl_session) {
	    	try {
				var cookie = JSON.parse(req.cookies.psl_session);	    		
		        console.log(cookie);
		        username = cookie.username;
		        console.log(username);
	    	} catch (error){
	    		console.log("cookie is not JSON");
	    	}
	    }

	    res.render('home.jade', {pageData: {username: username}});
	});

    return router;
};