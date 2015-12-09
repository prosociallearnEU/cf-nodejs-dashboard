/*jslint node: true*/
"use strict";

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Services
var SpaceService = require("../services/SpaceService");
SpaceService = new SpaceService();

module.exports = function (express) {

    var router = express.Router();
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
    router.use(cookieParser());

	router.get('/:guid/apps', function (req, res) {

		console.log("GET /spaces/:guid/apps")

		var endpoint = "";
		var username = "";
		var password = "";
		var spaceResult = null;

        var space_guid = req.params.guid;
        console.log("space_guid: " + space_guid);

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
                SpaceService.setEndpoint(endpoint);
                SpaceService.setCredential(username, password);
                return SpaceService.getApps(space_guid).then(function (result) {
                	spaceResult = result;
					//console.log(spaceResult.apps.resources);
               		res.render('spaces/spaceApps.jade', {pageData: {username: username, apps: spaceResult.apps.resources}});
		        }).catch(function (reason) {
		            console.log(reason);
		            res.render('global/globalError', {pageData: {error: reason, back:back}});
		        }).catch(function (reason) {
		        	console.log(reason);
		        });  

	    	} catch (error){
	    		console.log("cookie is not JSON", error);
	    		res.render('global/globalError', {pageData: {error: result, back:back}});
	    	}
	    }


	});

    return router;
};