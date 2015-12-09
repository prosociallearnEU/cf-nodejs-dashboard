/*jslint node: true*/

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

//Services
var AppServices = require("../services/AppService");
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

    // GET /apps/:guid
    router.get('/:guid', nocache, function (req, res) {

        console.log("GET /apps/:guid");

        var username = "";
        var back = {
            path:"/home/",
            text:"Home"
        }

        if (req.cookies.psl_session) {
            try {
                var cookie = JSON.parse(req.cookies.psl_session);
                username = cookie.username;
                AppServices.setEndpoint(cookie.endpoint);
                AppServices.setCredential(cookie.username, cookie.password);

                var app_guid = req.params.guid;
                console.log("app_guid: " + app_guid);

                return AppServices.view(app_guid).then(function (result) {
                    res.render('apps/app.jade', {pageData: {username: username, app: result}});
                }).catch(function (reason) {
                    console.log(reason);
                    res.render('global/globalError', {pageData: {error: reason, back:back}});
                });

            } catch (error){
                console.log("cookie is not JSON");
            }                
        }

    });

    // GET /apps/:guid/view/
    router.get('/:guid/view', nocache, function (req, res) {

        console.log("GET /apps/:guid/view");

        var username = "";
        var back = {
            path:"/home",
            text:"Home"
        }

        if (req.cookies.psl_session) {
            try {
                var cookie = JSON.parse(req.cookies.psl_session);
                username = cookie.username;
                AppServices.setEndpoint(cookie.endpoint);
                AppServices.setCredential(cookie.username, cookie.password);

                var app_guid = req.params.guid;
                console.log("app_guid: " + app_guid);

                return AppServices.view(app_guid).then(function (result) {
                    //console.log(result);
                    res.render('apps/appView.jade', {pageData: {username: username, info: result}});
                }).catch(function (reason) {
                    console.log(reason);
                    res.render('global/globalError', {pageData: {error: reason, back:back}});
                });

            } catch (error){
                console.log("cookie is not JSON");
            }                
        }

    });

    router.get('/:guid/upload', nocache, function (req, res) {

        console.log("GET /apps/:guid/upload");

        var username = "";

        if (req.cookies.psl_session) {
            try {
                var cookie = JSON.parse(req.cookies.psl_session);
                username = cookie.username;

                var app_guid = req.params.guid;
                console.log("app_guid: " + app_guid);

                res.render('apps/appUpload.jade', {pageData: {username: username, app_guid: app_guid}});

            } catch (error){
                console.log("cookie is not JSON");
            }                
        }

    });

    router.post('/upload', upload.single('file'), function (req, res) {

        console.log("POST /apps/upload");

        var app_guid = null;

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);

            app_guid = req.body.app_guid;
            var zipPath = req.file.destination + req.file.filename;

            console.log("app_guid: " + app_guid);
            console.log(zipPath);

            return AppServices.upload(app_guid, zipPath).then(function (result) {
                res.json(result);
            }).catch(function (reason) {
                console.log(reason);
                var back = {
                    path:"/apps/" + app_guid,
                    text:"Apps"
                }
                res.render('global/globalError', {pageData: {error: result, back:back}});
            });            
        }

    });

    router.get('/:guid/stop', nocache, function (req, res) {

        console.log("GET /apps/:guid/stop");

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);

            var app_guid = req.params.guid;
            console.log("app_guid: " + app_guid);

            return AppServices.stop(app_guid).then(function (result) {
                console.log(result);
                res.json({ result: 1 });
            }).catch(function (reason) {
                console.log(reason);
                res.json({ error: 1, reason:reason });                
            });            
        }

    });

    router.get('/:guid/start', nocache, function (req, res) {

        console.log("GET /apps/:guid/start");

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);

            var app_guid = req.params.guid;
            console.log("app_guid: " + app_guid);

            return AppServices.start(app_guid).then(function (result) {
                console.log(result);
                res.json({ result: 1 });
            }).catch(function (reason) {
                console.log(reason);
                res.json({ error: 1, reason:reason });                
            });         
        }

    });

    router.get('/:guid/restage', nocache, function (req, res) {

        console.log("GET /apps/:guid/restage");

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);

            var app_guid = req.params.guid;
            console.log("app_guid: " + app_guid);

            return AppServices.restage(app_guid).then(function (result) {
                console.log(result);
                res.json({ result: 1 });
            }).catch(function (reason) {
                console.log(reason);
                res.json({ error: 1, reason:reason });                
            });         
        }

    });

    router.get('/:guid/remove', nocache, function (req, res) {

        console.log("GET Apps Remove");

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);

            var app_guid = req.params.guid;
            console.log("app_guid: " + app_guid);

            return AppServices.remove(app_guid).then(function (result) {
                console.log(result);
                res.json({ result: 1 });
            }).catch(function (reason) {
                console.log(reason);
                res.json({ error: 1, reason:reason });                
            });            
        }

    });

    router.get('/:guid/log', nocache, function (req, res) {

        console.log("GET /apps/:guid/log");

        var username = "";

        if (req.cookies.psl_session) {
            try {
                var cookie = JSON.parse(req.cookies.psl_session);
                username = cookie.username;
                AppServices.setEndpoint(cookie.endpoint);
                AppServices.setCredential(cookie.username, cookie.password);

                var app_guid = req.params.guid;
                console.log("app_guid: " + app_guid);

                return AppServices.getLogs(app_guid).then(function (result) {
                    //console.log(result);
                    res.render('apps/appLog.jade', {pageData: {username: username, log: result, guid: app_guid}});
                }).catch(function (reason) {
                    var back = {
                        path:"/apps/" + app_guid,
                        text:"Apps"
                    }
                    res.render('global/globalError', {pageData: {error: result, back:back}});
                });

            } catch (error){
                console.log("cookie is not JSON");
            }                
        }

    });

    router.post('/:guid/open', nocache, function (req, res) {

        console.log("GET /apps/:guid/open");

        if (req.cookies.psl_session) {
            var cookie = JSON.parse(req.cookies.psl_session);
            //console.log(cookie);
            AppServices.setEndpoint(cookie.endpoint);
            AppServices.setCredential(cookie.username, cookie.password);

            var app_guid = req.params.guid;
            console.log("app_guid: " + app_guid);

            return AppServices.open(app_guid).then(function (result) {
                console.log(result);
                res.json({ result: 1 , url: result});
            }).catch(function (reason) {
                console.log(reason);
                res.json({ error: 1, reason:reason });                
            });              
        }

    });

    return router;
};


