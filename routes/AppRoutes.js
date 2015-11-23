/*jslint node: true*/

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

//Services
var AppServices = require("../services/AppServices");
AppServices = new AppServices();

module.exports = function (express) {
    "use strict";
    var router = express.Router();
    var upload = multer({dest: 'uploads/'});
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({extended: false}));// parse application/x-www-form-urlencoded

    var cookieName = "psl_session";
    var cookieSecret = "secret";//TODO: Move to config file
    router.use(cookieParser(cookieSecret));

    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }

    // GET /apps/
    router.get('/', nocache, function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("GET /apps");

        return AppServices.getApps().then(function (result) {
            res.render('apps/apps.jade', {pageData: {apps: result.resources}});
        }).catch(function (reason) {
            console.log(reason);
            res.render('global/globalError', {pageData: reason});
        });
    });

    // GET /apps/view/:guid
    router.get('/view/:guid', nocache, function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("GET /apps/view/:guid");

        var app_guid = req.params.guid;
        console.log("app_guid: " + app_guid);

        return AppServices.view(app_guid).then(function (result) {
            //console.log(result);
            res.render('apps/appView.jade', {pageData: {info: result}});
        }).catch(function (reason) {
            console.log(reason);
            res.render('global/globalError', {pageData: reason});
        });
    });

    router.get('/add', nocache, function (req, res) {
        res.render('apps/appAdd.jade');
    });

    router.post('/add', nocache, function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("POST /apps/add");

        var appName = req.body.appname;
        var buildPack = req.body.buildpack;

        console.log("App: " + appName);
        console.log("Buildpack: " + buildPack);

        return AppServices.add(appName, buildPack).then(function () {
            res.redirect('/apps');
        }).catch(function (reason) {
            console.log(reason);
            res.render('global/globalError', {pageData: reason});
        });

    });

    router.get('/log/:guid', nocache, function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("GET Apps Log");

        var app_guid = req.params.guid;
        console.log(app_guid);

        return AppServices.getLogs(app_guid).then(function (result) {
            //console.log(result);
            res.render('apps/appLog.jade', {pageData: {log: result, guid: app_guid}});
        }).catch(function (reason) {
            res.json({error: reason});
        });
    });

    router.get('/stop/:guid', nocache, function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("GET Apps Stop");

        var app_guid = req.params.guid;
        console.log(app_guid);

        return AppServices.stop(app_guid).then(function (result) {
            console.log(result);
            res.json(result);
        }).catch(function (reason) {
            console.log(reason);
            res.render('global/globalError', {pageData: reason});
        });

    });

    router.get('/start/:guid', nocache, function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("GET Apps Start");

        var app_guid = req.params.guid;
        console.log(app_guid);

        return AppServices.start(app_guid).then(function (result) {
            console.log(result);
            res.json(result);
        }).catch(function (reason) {
            console.log(reason);
            res.render('global/globalError', {pageData: reason});
        });

    });

    router.get('/remove/:guid', nocache, function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("GET Apps Remove");

        var app_guid = req.params.guid;
        console.log(app_guid);

        return AppServices.remove(app_guid).then(function (result) {
            console.log(result);
            res.json(result);
        }).catch(function (reason) {
            console.log(reason);
            res.render('global/globalError', {pageData: reason});
        });

    });

    router.get('/upload', nocache, function (req, res) {
        res.render('apps/appUpload.jade');
    });

    router.post('/upload', upload.single('file'), function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("POST Upload");

        var app_guid = req.body.app_guid;
        var zipPath = req.file.destination + req.file.filename;

        console.log(app_guid);
        console.log(zipPath);

        return AppServices.upload(app_guid, zipPath).then(function (result) {
            console.log(result);
            res.json(result);
        }).catch(function (reason) {
            console.log(reason);
            res.render('global/globalError', {pageData: reason});
        });
    });

    router.post('/open/:guid', nocache, function (req, res) {

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);
        }

        console.log("GET Open App");

        var app_guid = req.params.guid;
        console.log(app_guid);

        return AppServices.open(app_guid).then(function (result) {
            console.log(result);
            res.json(result);
        }).catch(function (reason) {
            console.log(reason);
            res.render('global/globalError', {pageData: reason});
        });

    });

    return router;
};


