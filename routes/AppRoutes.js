/*jslint node: true*/
"use strict";

var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
var multer = require('multer');

//Services
var AppServices = require("../services/AppServices");
AppServices = new AppServices();

module.exports = function (express) {

    var router = express.Router();
    var upload = multer({ dest: 'uploads/' });
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded


    var cookieName = "psl_session";
    var cookieSecret = "secret";//TODO: Move to config file
    router.use(cookieParser(cookieSecret));

    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }

    router.get('/apps', nocache, function (req, res) {
        res.render('apps');
    });

    router.get('/apps/getApps', nocache, function (req, res) {

        if(req.cookies.psl_session){
            var cookie = JSON.parse(req.cookies.psl_session);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username,cookie.password);
        }

        console.log("GET Apps");

        return AppServices.getApps().then(function (result) {
            res.json(result);
        }).catch(function (reason) {
            res.json({"error": reason});
        });

    });

    router.get('/apps/view', nocache, function (req, res) {
        res.render('appView');
    });

    router.get('/apps/view/:guid', nocache, function (req, res) {

        if(req.cookies.psl_session){
            var cookie = JSON.parse(req.cookies.psl_session);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username,cookie.password);
        }

        console.log("GET Apps View");

        var app_guid = req.params.guid;
        console.log(app_guid);

        return AppServices.view(app_guid).then(function (result) {
            res.json(result);
        }).catch(function (reason) {
            res.json({"error": reason});
        });

    });    

    router.get('/apps/add', nocache, function (req, res) {
        res.render('appAdd');
    });

    router.post('/apps/add', nocache, function (req, res) {

        if(req.cookies.psl_session){
            var cookie = JSON.parse(req.cookies.psl_session);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username,cookie.password);
        }

        console.log("GET Apps View");

        var appName = req.body.appname;
        var buildPack = req.body.buildpack;
        var app_guid = null;

        console.log(appName);
        console.log(buildPack);

        return AppServices.createApp(appName, buildPack).then(function (result) {
            app_guid = result.metadata.guid;
            res.render('apps');
        }).catch(function (reason) {
            res.json({"error": reason});
        });

    });

    router.get('/apps/log', nocache, function (req, res) {
        res.render('appLog');
    });

    router.get('/apps/log/:guid', nocache, function (req, res) {

        if(req.cookies.psl_session){
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username,cookie.password);
        }

        console.log("GET Apps Log");

        var app_guid = req.params.guid;
        //console.log(app_guid);

        return AppServices.getLogs(app_guid).then(function (result) {
            console.log(result);
            res.json(result);
        }).catch(function (reason) {
            //console.log(reason);
            res.json({"error": reason});
        });

    });  

    return router;
};

