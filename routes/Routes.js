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

    router.post('/auth/login', jsonParser, Login.login);
    router.get('/apps', jsonParser, Apps.getApps);
    router.get('/apps/:guid/view', jsonParser, Apps.view);
    router.post('/apps/create', jsonParser, Apps.create);
    router.post('/apps/upgrade', jsonParser, Apps.upgrade);
    router.post('/apps/stop', jsonParser, Apps.stop);
    router.post('/apps/start', jsonParser, Apps.startApp);
    router.post('/apps/remove', jsonParser, Apps.removeApp);
    router.post('/apps/open', jsonParser, Apps.open);//MOVE TO GET
    router.post('/apps/upload', upload.single('file'), Apps.upload);

    return router;
};


