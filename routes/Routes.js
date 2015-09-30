/*jslint node: true*/
"use strict";

var bodyParser = require('body-parser');
var multer = require('multer');

//Routes
var Login = require('./Login');
var Apps = require('./Apps');

module.exports = function (express) {

    var router = express.Router();
    var jsonParser = bodyParser.json();
    var upload = multer({ dest: 'uploads/' });
    router.use(jsonParser);

    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }

    router.post('/auth/login', nocache, Login.login);
    router.get('/apps', nocache, Apps.getApps);
    router.get('/apps/:guid/view', nocache, Apps.view);
    router.post('/apps/create', nocache, Apps.create);
    router.post('/apps/stop', nocache, Apps.stop);
    router.post('/apps/start', nocache, Apps.startApp);
    router.post('/apps/remove', nocache, Apps.removeApp);
    router.post('/apps/open', nocache, Apps.open);//MOVE TO GET
    router.post('/apps/upload', upload.single('file'), Apps.upload);
    router.post('/apps/log', nocache, Apps.log);

    return router;
};


