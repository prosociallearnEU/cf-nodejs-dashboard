/*jslint node: true*/
"use strict";

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Services
var HomeService = require("../services/HomeService");
HomeService = new HomeService();

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
	        console.log("No https");
	    }
	});

	router.get('/home', function (req, res) {

		console.log("GET /home/")

		var endpoint = "";
		var username = "";
		var password = "";
		var homeResult = null;

        var back = {
            path:"/home/",
            text:"Home"
        }

	    if (req.cookies.psl_session) {
	    	try {
				var cookie = JSON.parse(req.cookies.psl_session);	    		
		        console.log(cookie);
		        endpoint = cookie.endpoint;
		        username = cookie.username;
		        password = cookie.password;
                HomeService.setEndpoint(endpoint);
                HomeService.setCredential(username, password);
                return HomeService.getOrganizations().then(function (result) {
                	homeResult = result;
               		res.render('home.jade', {pageData: {username: username, data: homeResult}});
		        }).catch(function (reason) {
		            //console.log(reason);
		            res.render('global/globalError', {pageData: {error: reason, back:back}});
		        });

	    	} catch (error){
	    		console.log("cookie is not JSON", error);
	    	}
	    }else {
	    	console.log("No session cookie");
	    }


	});

    return router;
};