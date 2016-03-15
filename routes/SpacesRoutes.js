/*jslint node: true*/
"use strict";

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Services
var SpaceService = require("../services/SpaceService");
SpaceService = new SpaceService();
var AppServices = require("../services/AppService");
AppServices = new AppServices();

module.exports = function (express) {

    var router = express.Router();
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
    router.use(cookieParser());

    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }


	router.get('/:guid/apps', function (req, res) {

		console.log("GET /spaces/:guid/apps");

		var endpoint = "";
		var username = "";
		var password = "";
		var spaceResult = null;

        var space_guid = req.params.guid;
        console.log("space_guid: " + space_guid);
        var back = {
            path:"/home/",
            text:"Home"
        };
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
               		res.render('spaces/spaceApps.jade', {pageData: {username: username, apps: spaceResult.apps.resources, space_guid:space_guid}});
		        }).catch(function (reason) {
		            console.log(reason);
		            res.render('global/globalError', {pageData: {error: reason, back:back}});
		        }).catch(function (reason) {
		        	console.log(reason);
		        });  

	    	} catch (error){
	    		console.log("cookie is not JSON", error);	    		
	    		res.render('global/globalError', {pageData: {error: error, back:back}});
	    	}
	    }

	});

    //GET /apps/add
    router.get('/:guid/apps/add', nocache, function (req, res) {

        var username = "";

        if (req.cookies.psl_session) {
            try {
                var cookie = JSON.parse(req.cookies.psl_session);
                username = cookie.username;

		        var space_guid = req.params.guid;
		        console.log("space_guid: " + space_guid);

                res.render('apps/appAdd.jade', {pageData: {username: username, space_guid:space_guid}});
            } catch (error){
                console.log("cookie is not JSON");
            }                
        }

    });

    router.post('/apps/add', nocache, function (req, res) {

    	console.log("POST /spaces/apps/add");

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);

	        var space_guid = req.body.space_guid;
	        var appName = req.body.appname;
	        var buildPack = req.body.buildpack;

	        console.log("space_guid: " + space_guid);
	        console.log("App: " + appName);
	        console.log("Buildpack: " + buildPack);

	        return AppServices.add(space_guid, appName, buildPack).then(function () {
	            res.redirect('/spaces/' + space_guid + "/apps");
	        }).catch(function (reason) {
	            console.log(reason);
		        var back = {
		            path:"/spaces/" + space_guid + "/apps",
		            text:"Space"
		        };
	            res.render('global/globalError', {pageData: {error: reason, back:back}});
	        });

        }

    });

    return router;
};